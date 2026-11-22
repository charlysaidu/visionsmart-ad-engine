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
import { textoBolivares, textoDolares, tituloEnLineas } from './util.ts';

export const VERSION_MOTOR = '0.2.0-fase1';
export { FORMATOS, FUENTE_JAKARTA, PLANTILLAS, IDS_PLANTILLAS };
export type { ContextoAnuncio, Formato, ModoPrecio, PlantillaId, Fuente, Plantilla, Layout } from './tipos.ts';
export type { DatosProducto, Caracteristica, Garantia } from './datos.ts';
export { caracteristicasDe, garantiaDe } from './datos.ts';
export { layoutDe } from './layouts.ts';
export { textoBolivares, textoDolares, redondearBs, miles, medir, tituloEnLineas, esc } from './util.ts';

/** Textos de precio segun el modo elegido. null = sin precio en la imagen (modo 'ninguno' o dato faltante). */
export function textosPrecio(modo: ModoPrecio, usd: number | null | undefined, tasa: number | null | undefined): { principal: string; secundario: string | null } | null {
  const bs = textoBolivares(usd, tasa), d = textoDolares(usd);
  if (modo === 'ninguno') return null;
  if (modo === 'usd') return d ? { principal: d, secundario: null } : null;
  if (modo === 'ambos') return bs ? { principal: bs, secundario: d } : d ? { principal: d, secundario: null } : null;
  return bs ? { principal: bs, secundario: null } : null;   // 'bs' (por defecto)
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
  const marca = { web: 'visionsmart.ve', redes: '@visionsmart.ve', ...(ctx.marca ?? {}) };

  const { lineas, tam } = tituloEnLineas(prod.nombre, lay.titulo.ancho, lay.titulo.tamMax, lay.titulo.tamMin);
  const txtPrecio = textosPrecio(ctx.precio ?? 'bs', prod.precioUsd, ctx.tasaBs);
  const etiqueta = ctx.etiquetaPrecio === undefined ? 'DESDE' : ctx.etiquetaPrecio;

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
    P.precio(d, txtPrecio, txtPrecio ? etiqueta : null),
    P.garantia(d, garantiaDe(prod.garantia)),
    P.pie(d, marca.web, marca.redes),
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${d.defs.join('')}</defs>${cuerpo}</svg>`;
}