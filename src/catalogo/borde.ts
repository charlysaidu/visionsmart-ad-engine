/**
 * Catalogo PDF «BORDE A BORDE» (motor 0.9.0): cada imagen 4:5 ocupa la HOJA COMPLETA, sin margen, sin cabecera ni banda blanca. Al desplazarse por el PDF las imagenes
 * quedan pegadas una tras otra, como una sola imagen larga. Modulo PURO (sin dependencias de plataforma). No toca nada de 0.8.0 (Carta / A4): es un diseño APARTE.
 *
 * PAGINA: 810 × 1012,5 pt = proporcion EXACTA 4:5. Es el tamaño de una imagen 1080 × 1350 px a 96 dpi (1 px de la imagen = 0,75 pt = 1 px de pantalla al 100 %),
 *   asi que la imagen del Generador cabe sin deformarse ni recortarse. Origen ARRIBA-IZQUIERDA, unidades en pt (como PDFKit y como SVG).
 *
 * PIEZAS (SVG; desde 1.2.0 las hojas internas NO llevan pie: son la imagen sola):
 *   · PORTADA y SEPARADOR de categoria: hoja completa, fondo OSCURO de marca (sin banda blanca). Opacos.
 *   · (1.2.0) Se ELIMINO el pie translucido («Precios vigentes al…» + «n / total») que iba sobre la parte baja de cada imagen: cortaba la ilusion de una sola imagen continua.
 *     La fecha de los precios queda SOLO en la portada; los enlaces clicables tambien.
 *   · TAMAÑO DEL SVG: viewBox en pt de la pagina y width/height en PIXELES a 2 px por pt (portada 1620 × 2025): es el tamaño al que se rasteriza.
 * IMAGENES QUE NO SON 4:5 (1:1, 9:16): «cubrir» (rectCubrir): se agrandan hasta llenar la hoja y se recorta lo que sobra, centradas; nunca hay bandas.
 * FUENTES: igual que 0.8.0 (Jakarta-*; Sistema PC usa las variantes ...ConFuentes de con-fuentes.ts).
 */
import { gradColores } from '../primitivas.ts';
import { FUENTE_JAKARTA } from '../tipos.ts';
import { medir, n, tituloEnLineas } from '../util.ts';
import type { Caja, TemaCtx } from '../temas/index.ts';
import type { Rect } from './geometria.ts';
import { capaTemaCatalogo, type CapaCatalogo } from './tema.ts';
import { COLORES_CATALOGO, TEXTO_SITIO, TEXTO_INSTAGRAM, SEPARADOR_PIE, lockup, texto, pad } from './render.ts';

/** Pagina borde a borde: proporcion 4:5 exacta (1080 × 1350 px a 96 dpi). */
export const PAGINA_BORDE = { ancho: 810, alto: 1012.5 } as const;
/**
 * Franja baja RESERVADA en las imagenes 4:5 (120 pt de 1012,5 = 160 px de 1350): las plantillas (R20) no ponen contenido ahi, solo su propio pie centrado.
 * Desde 1.2.0 el PDF ya NO pinta ningun pie translucido encima (las hojas internas son la imagen sola): la constante queda solo como contrato de las plantillas.
 */
export const PIE_BORDE_ALTO = 120;
/** Pixeles por punto al rasterizar las piezas borde a borde (2 px/pt: portada 1620 × 2025). */
export const PX_POR_PT_BORDE = 2;
export const pxBorde = (pt: number): number => Math.round(pt * PX_POR_PT_BORDE);

export const COLORES_BORDE = { fondo: '#050507', fondoMedio: '#0A0C11', texto: '#FFFFFF', gris: '#A9B2C6', claro: '#E3E8F2', grisClaro: '#7F8AA3', azul: COLORES_CATALOGO.azul, celeste: COLORES_CATALOGO.celeste, morado: COLORES_CATALOGO.morado } as const;
const MARCA = [COLORES_BORDE.azul, COLORES_BORDE.celeste, COLORES_BORDE.morado];
const F = FUENTE_JAKARTA;

export type PaginaBordeGeo = {
  tamano: 'borde'; porPagina: 1; orientacion: 'vertical'; ancho: number; alto: number; bordeABorde: true; margen: 0;
  /** La imagen ocupa TODA la hoja. */
  imagen: Rect;
};
/** Geometria de la pagina borde a borde. */
export function paginaBorde(): PaginaBordeGeo {
  const { ancho, alto } = PAGINA_BORDE;
  return { tamano: 'borde', porPagina: 1, orientacion: 'vertical', ancho, alto, bordeABorde: true, margen: 0, imagen: { x: 0, y: 0, w: ancho, h: alto } };
}

/**
 * «Cubrir»: rectangulo (en pt, relativo a la hoja) en el que hay que dibujar una imagen de anchoPx × altoPx para que LLENE la hoja sin deformarse; lo que se sale por
 * los lados / arriba y abajo se recorta (hay que recortar al rectangulo de la hoja). Centrada. Una imagen 4:5 devuelve exactamente la hoja (0, 0, 810, 1012,5).
 */
export function rectCubrir(anchoPx: number, altoPx: number): Rect {
  const { ancho, alto } = PAGINA_BORDE;
  if (!(anchoPx > 0) || !(altoPx > 0)) throw new Error(`Tamano de imagen invalido: ${anchoPx}×${altoPx}`);
  const k = Math.max(ancho / anchoPx, alto / altoPx), w = anchoPx * k, h = altoPx * k;
  const r = (x: number) => Math.round(x * 1e4) / 1e4;
  return { x: r((ancho - w) / 2), y: r((alto - h) / 2), w: r(w), h: r(h) };
}

export type DatosPortadaBorde = { tipo: 'categoria' | 'inventario'; titulo?: string; fecha: string; tema?: TemaCtx | null };
export type DatosSeparadorBorde = { categoria: string; cantidad?: number | null; tema?: TemaCtx | null };

/** Envoltura: viewBox en pt, width/height en px (2 px/pt). */
function svgBorde(wPt: number, hPt: number, defs: string, cuerpo: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxBorde(wPt)}" height="${pxBorde(hPt)}" viewBox="0 0 ${n(wPt)} ${n(hPt)}"><defs>${defs}</defs>${cuerpo}</svg>`;
}

/** Fondo oscuro de marca de hoja completa (portada y separador): degradado casi negro + dos luces suaves + barras de marca arriba y abajo. */
function fondoOscuro(W: number, H: number, id: string): { defs: string; cuerpo: string } {
  const defs = [gradColores(`${id}Barra`, MARCA, 0),
    `<linearGradient id="${id}Fondo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040406"/><stop offset="0.6" stop-color="${COLORES_BORDE.fondoMedio}"/><stop offset="1" stop-color="${COLORES_BORDE.fondo}"/></linearGradient>`,
    `<radialGradient id="${id}LuzA" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${COLORES_BORDE.celeste}" stop-opacity="0.18"/><stop offset="1" stop-color="${COLORES_BORDE.celeste}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id}LuzB" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${COLORES_BORDE.morado}" stop-opacity="0.2"/><stop offset="1" stop-color="${COLORES_BORDE.morado}" stop-opacity="0"/></radialGradient>`].join('');
  const cuerpo = `<rect x="0" y="0" width="${n(W)}" height="${n(H)}" fill="url(#${id}Fondo)"/>` +
    `<circle cx="${n(W * 0.92)}" cy="${n(H * 0.06)}" r="${n(W * 0.62)}" fill="url(#${id}LuzA)"/><circle cx="${n(W * 0.06)}" cy="${n(H * 0.96)}" r="${n(W * 0.7)}" fill="url(#${id}LuzB)"/>` +
    `<rect x="0" y="0" width="${n(W)}" height="14" fill="url(#${id}Barra)"/><rect x="0" y="${n(H - 14)}" width="${n(W)}" height="14" fill="url(#${id}Barra)"/>`;
  return { defs, cuerpo };
}

// ── PORTADA (hoja completa, oscura) ─────────────────────────────────────────────
function portadaInterno(datos: DatosPortadaBorde) {
  const W = PAGINA_BORDE.ancho, H = PAGINA_BORDE.alto, cx = W / 2, esCat = datos.tipo === 'categoria';
  const fo = fondoOscuro(W, H, 'bpf');
  const dLogo = 138, yLogo = H * 0.25, L = lockup(cx - dLogo / 2, yLogo, dLogo, false, 'bpLogo');
  const maxAncho = W * 0.82, lineasT = esCat ? tituloEnLineas(String(datos.titulo ?? ''), maxAncho, 80, 34) : tituloEnLineas('CATÁLOGO VISIONSMART', maxAncho, 82, 38);
  const tam = lineasT.tam, interl = tam * 1.08, yTit = H * 0.52 - ((lineasT.lineas.length - 1) * interl) / 2;
  const etiqueta = esCat ? 'CATÁLOGO DE PRODUCTOS' : 'INVENTARIO COMPLETO', yEtq = yTit - tam * 1.22;
  const wMax = Math.max(...lineasT.lineas.map((l) => medir(l, 'extrabold', tam))), yBarra = yTit + (lineasT.lineas.length - 1) * interl + tam * 0.45;
  const yFecha = yBarra + 52, tamFecha = 22, yPie = H - 62, tamPie = 15;
  let cuerpo = fo.cuerpo + L.svg + texto(cx, yEtq, 17, F.bold, COLORES_BORDE.gris, etiqueta, 'middle', ' letter-spacing="5"');
  lineasT.lineas.forEach((l, i) => { cuerpo += texto(cx, yTit + i * interl, tam, F.extrabold, i === lineasT.lineas.length - 1 ? 'url(#bpAcento)' : COLORES_BORDE.texto, l, 'middle'); });
  cuerpo += `<rect x="${n(cx - 48)}" y="${n(yBarra)}" width="96" height="5" rx="2.5" fill="url(#bpAcento)"/>` +
    texto(cx, yFecha, tamFecha, F.bold, COLORES_BORDE.gris, datos.fecha, 'middle') +
    texto(cx, yPie, tamPie, F.regular, COLORES_BORDE.grisClaro, `${TEXTO_SITIO}${SEPARADOR_PIE}${TEXTO_INSTAGRAM}`, 'middle');
  const wFecha = medir(datos.fecha, 'bold', tamFecha), wPie = medir(`${TEXTO_SITIO}${SEPARADOR_PIE}${TEXTO_INSTAGRAM}`, 'regular', tamPie);
  const zonas: { nombre: string; caja: Caja }[] = [
    { nombre: 'logo', caja: pad(L.caja, 8) },
    { nombre: 'titulo', caja: { x: cx - wMax / 2 - 10, y: yEtq - 22, w: wMax + 20, h: yBarra + 10 - (yEtq - 22) } },
    { nombre: 'fecha', caja: { x: cx - wFecha / 2 - 10, y: yFecha - tamFecha - 5, w: wFecha + 20, h: tamFecha + 14 } },
    { nombre: 'pie', caja: { x: cx - wPie / 2 - 10, y: yPie - 20, w: wPie + 20, h: 32 } },
    { nombre: 'barra-superior', caja: { x: 0, y: 0, w: W, h: 18 } }, { nombre: 'barra-inferior', caja: { x: 0, y: H - 18, w: W, h: 18 } },
  ];
  const wSitio = medir(TEXTO_SITIO, 'regular', tamPie), wSep = medir(`${TEXTO_SITIO}${SEPARADOR_PIE}`, 'regular', tamPie), wInst = medir(TEXTO_INSTAGRAM, 'regular', tamPie), x0 = cx - wPie / 2;
  const enlaces: Record<'sitio' | 'instagram', Rect> = { sitio: { x: x0, y: yPie - tamPie, w: wSitio, h: tamPie * 1.35 }, instagram: { x: x0 + wSep, y: yPie - tamPie, w: wInst, h: tamPie * 1.35 } };
  return { defs: fo.defs + L.defs + gradColores('bpAcento', MARCA, 0), cuerpo, zonas, W, H, enlaces };
}
export const portadaBordeZonas = (datos: DatosPortadaBorde): { nombre: string; caja: Caja }[] => portadaInterno(datos).zonas;
/** Rectangulos (pt, en coordenadas de la PAGINA) de «visionsmart.app» y «@visionsmart.app» del pie de la PORTADA, para las anotaciones de enlace del PDF. */
export function portadaBordeEnlaces(datos: DatosPortadaBorde): Record<'sitio' | 'instagram', Rect> {
  const e = portadaInterno(datos).enlaces, r = (x: number) => Math.round(x * 100) / 100, q = (c: Rect): Rect => ({ x: r(c.x), y: r(c.y), w: r(c.w), h: r(c.h) });
  return { sitio: q(e.sitio), instagram: q(e.instagram) };
}
export function renderPortadaBorde(datos: DatosPortadaBorde): string {
  const p = portadaInterno(datos), capa: CapaCatalogo = capaTemaCatalogo(datos.tema, p.W, p.H, p.zonas, `catalogo-borde-portada-${datos.tipo}`);
  return svgBorde(p.W, p.H, p.defs, p.cuerpo + capa.svg);
}

// ── SEPARADOR de categoria (hoja completa, oscuro) ──────────────────────────────
function separadorInterno(datos: DatosSeparadorBorde) {
  const W = PAGINA_BORDE.ancho, H = PAGINA_BORDE.alto, cx = W / 2, fo = fondoOscuro(W, H, 'bsf');
  const nombre = String(datos.categoria ?? '').trim().toLocaleUpperCase('es'), maxAncho = W * 0.84;
  const dLogo = 96, yLogo = H * 0.2, L = lockup(cx - dLogo / 2, yLogo, dLogo, false, 'bsLogo');
  const lt = tituloEnLineas(nombre || 'CATEGORÍA', maxAncho, 118, 44), tam = lt.tam, interl = tam * 1.08, yTit = H * 0.52 - ((lt.lineas.length - 1) * interl) / 2;
  const wMax = Math.max(...lt.lineas.map((l) => medir(l, 'extrabold', tam))), yBarra = yTit + (lt.lineas.length - 1) * interl + tam * 0.42;
  const cant = Number(datos.cantidad) > 0 ? `${Math.round(Number(datos.cantidad))} ${Math.round(Number(datos.cantidad)) === 1 ? 'producto' : 'productos'}` : '', yCant = yBarra + 56, tamCant = 24;
  const yEtq = yTit - tam * 1.15;
  let cuerpo = fo.cuerpo + L.svg + texto(cx, yEtq, 17, F.bold, COLORES_BORDE.gris, 'CATEGORÍA', 'middle', ' letter-spacing="6"');
  lt.lineas.forEach((l, i) => { cuerpo += texto(cx, yTit + i * interl, tam, F.extrabold, COLORES_BORDE.texto, l, 'middle'); });
  cuerpo += `<rect x="${n(cx - 56)}" y="${n(yBarra)}" width="112" height="6" rx="3" fill="url(#bsAcento)"/>` + (cant ? texto(cx, yCant, tamCant, F.bold, COLORES_BORDE.gris, cant, 'middle') : '');
  const wCant = cant ? medir(cant, 'bold', tamCant) : 0;
  const zonas: { nombre: string; caja: Caja }[] = [
    { nombre: 'logo', caja: pad(L.caja, 8) },
    { nombre: 'titulo', caja: { x: cx - wMax / 2 - 12, y: yEtq - 22, w: wMax + 24, h: yBarra + 12 - (yEtq - 22) } },
    ...(cant ? [{ nombre: 'cantidad', caja: { x: cx - wCant / 2 - 10, y: yCant - tamCant - 4, w: wCant + 20, h: tamCant + 14 } }] : []),
    { nombre: 'barra-superior', caja: { x: 0, y: 0, w: W, h: 18 } }, { nombre: 'barra-inferior', caja: { x: 0, y: H - 18, w: W, h: 18 } },
  ];
  return { defs: fo.defs + L.defs + gradColores('bsAcento', MARCA, 0), cuerpo, zonas, W, H };
}
export const separadorBordeZonas = (datos: DatosSeparadorBorde): { nombre: string; caja: Caja }[] => separadorInterno(datos).zonas;
export function renderSeparadorBorde(datos: DatosSeparadorBorde): string {
  const p = separadorInterno(datos), capa = capaTemaCatalogo(datos.tema, p.W, p.H, p.zonas, 'catalogo-borde-separador');
  return svgBorde(p.W, p.H, p.defs, p.cuerpo + capa.svg);
}
