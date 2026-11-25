/**
 * visionsmart-ad-engine — motor de composicion de imagenes publicitarias.
 *
 *   renderSvg(plantilla, contexto, formato) -> string (documento SVG completo y autocontenido)
 *
 * Contrato compartido: Sistema PC (Chromium) y App Finanzas (react-native-svg) rasterizan el MISMO SVG.
 * Reglas: TypeScript puro, sin dependencias ni modulos nativos, sin APIs de plataforma (ni DOM ni Intl ni toLocaleString),
 * sin filtros blur ni emojis. Brillos = degradados radiales. Medicion de texto con las metricas reales de Plus Jakarta Sans.
 * Salida determinista: mismo contexto -> mismo SVG.
 *
 * Fuentes: el SVG usa los nombres Jakarta-Regular / Jakarta-Bold / Jakarta-ExtraBold.
 *   · PC (Chromium): renderSvgConFuentes (src/con-fuentes.ts) incrusta las 3 TTF como @font-face base64 dentro del SVG.
 *   · Celular: react-native-svg NO soporta @font-face; se registran con expo-font los MISMOS archivos TTF (paquete @expo-google-fonts/plus-jakarta-sans).
 */
import { caracteristicasDe, garantiaDe } from './datos.ts';
import { layoutDe } from './layouts.ts';
import { PLANTILLAS, IDS_PLANTILLAS } from './plantillas.ts';
import * as P from './primitivas.ts';
import { FORMATOS, FUENTE_JAKARTA, type ContextoAnuncio, type Formato, type ModoPrecio, type PlantillaId } from './tipos.ts';
import { calcularPromo } from './promo.ts';
import { capaDeTema, etiquetaDeTema } from './temas/index.ts';
import { textoBolivares, textoDolares, tituloEnLineas } from './util.ts';

export const VERSION_MOTOR = '0.9.0';
export { calcularPromo, fechaCorta, textoUnidades, type DatosPromo, type PromoCalculada } from './promo.ts';
export { repartirPlantillas, crearAleatorio } from './repartir.ts';
export { TEMAS, IDS_TEMAS, INTENSIDADES, ETIQUETAS_PROMO_NAVIDAD, zonasProtegidas, capaDeTema, hashSemilla, intersecta, type TemaCtx, type IdTema, type Intensidad, type ElementoTema, type Caja, type CapaTema, type ZonaProtegida, type DefinicionTema } from './temas/index.ts';
export * from './catalogo/index.ts';
export { zipPorPartes, zipEnMemoria, crc32, nombreSeguro, type EntradaZip } from './zip.ts';
export { FORMATOS, FUENTE_JAKARTA, PLANTILLAS, IDS_PLANTILLAS };
export type { ContextoAnuncio, Formato, ModoPrecio, PlantillaId, Fuente, Plantilla, Layout } from './tipos.ts';
export type { DatosProducto, Caracteristica, Garantia } from './datos.ts';
export { caracteristicasDe, garantiaDe } from './datos.ts';
export { layoutDe } from './layouts.ts';
export { textoBolivares, textoDolares, redondearBs, miles, medir, tituloEnLineas, esc } from './util.ts';

/** Textos de precio segun el modo elegido. null = sin precio en la imagen (modo 'ninguno' o dato faltante). */
export function textosPrecio(modo: ModoPrecio, usd: number | null | undefined, tasa: number | null | undefined): string | null {
  if (modo === 'ninguno') return null;
  if (modo === 'usd') return textoDolares(usd);
  return textoBolivares(usd, tasa);   // 'bs' (por defecto): sin tasa valida no se inventa el precio
}

export function renderSvg(id: PlantillaId, ctx: ContextoAnuncio, formato: Formato): string {
  const p = PLANTILLAS[id];
  if (!p) throw new Error(`Plantilla desconocida: ${id}`);
  const dim = FORMATOS[formato];
  if (!dim) throw new Error(`Formato desconocido: ${formato}`);
  const { ancho: W, alto: H } = dim;
  const lay = layoutDe(p, formato);
  const d: P.Dibujo = { W, H, p, lay, fu: ctx.fuente ?? FUENTE_JAKARTA, defs: [] };
  const prod = ctx.producto;
  const marca = { web: 'visionsmart.app', redes: '@visionsmart.app', ...(ctx.marca ?? {}) };

  const { lineas, tam } = tituloEnLineas(prod.nombre, lay.titulo.ancho, lay.titulo.tamMax, lay.titulo.tamMin);
  const modo = ctx.precio ?? 'bs';
  const promo = calcularPromo(prod.precioUsd, ctx.promo);
  // en promocion el precio grande es el promocional y el anterior sale tachado; la etiqueta pasa a "OFERTA"
  const txtPrecio = textosPrecio(modo, promo ? promo.precioUsd : prod.precioUsd, ctx.tasaBs);
  const txtAnterior = promo && promo.anteriorUsd != null && txtPrecio ? textosPrecio(modo, promo.anteriorUsd, ctx.tasaBs) : null;
  const tema = ctx.tema && ctx.tema.id ? ctx.tema : null;                          // sin tema: la salida es IDENTICA a la de siempre
  let etiqueta = ctx.etiquetaPrecio === undefined ? (promo ? 'OFERTA' : 'PRECIO') : ctx.etiquetaPrecio;
  if (tema && promo) etiqueta = etiquetaDeTema(tema, id, etiqueta);               // solo cambia el TEXTO de la etiqueta de oferta (no precios ni calculos)

  // el orden de dibujo es el orden de las capas: fondo -> adornos -> (vidrio) -> podio -> foto -> textos -> logo/pie
  const cuerpo = [
    P.fondo(d),
    P.adornosFondo(d),
    P.adornoDetrasFoto(d),
    P.podio(d),
    P.foto(d, prod.fotoHref),
    P.logo(d),
    P.titulo(d, lineas, tam),
    P.lista(d, caracteristicasDe(prod, lay.lista.cantidad)),
    P.precio(d, txtPrecio, txtPrecio ? etiqueta : null, txtAnterior),
    P.garantia(d, garantiaDe(prod.garantia)),
    promo ? P.promoExtras(d, promo) : '',
    P.pie(d, marca.web, marca.redes),
  ].join('');

  // el tema es una capa decorativa SOBRE la plantilla ya dibujada (nunca dentro de las zonas protegidas)
  const capa = tema ? (capaDeTema(d, tema, id, !!promo)?.svg ?? '') : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${d.defs.join('')}</defs>${cuerpo}${capa}</svg>`;
}