/**
 * Piezas SVG del catalogo PDF: PORTADA, CABECERA y PIE. Puras (mismo input -> mismo SVG), en el estilo de renderSvg: fuente de marca (Plus Jakarta Sans),
 * logo original y paleta Vision Smart (azul #1367A4 → celeste #4EA8DF → morado #9D40CB). Tema opcional (Navidad) como capa con zonas protegidas.
 *
 * UNIDADES Y TAMAÑO DEL SVG (documentado para quien rasteriza):
 *   · viewBox en PUNTOS de la pagina PDF (p. ej. cabecera Carta: "0 0 612 70"): las coordenadas y los tamaños de letra del SVG estan en pt.
 *   · width / height en PIXELES a 150 dpi (p. ej. cabecera Carta: 1275 × 146): es el tamaño al que hay que rasterizar. Para PDFKit: doc.image(png, x, y, { width: ptAncho, height: ptAlto }).
 *   · La portada ocupa la pagina completa (paginaDe(...).ancho × alto); la cabecera y el pie, sus zonas (paginaDe(...).cabecera / .pie).
 * FUENTES: font-family "Jakarta-Regular" / "Jakarta-Bold" / "Jakarta-ExtraBold" (como las plantillas). Sistema PC usa las variantes ...ConFuentes (con-fuentes.ts).
 */
import { gradColores } from '../primitivas.ts';
import { FUENTE_JAKARTA } from '../tipos.ts';
import { esc, medir, n, recortar, tamParaAncho, tituloEnLineas } from '../util.ts';
import type { Caja, TemaCtx } from '../temas/index.ts';
import { paginaDe, pxDePt, type PaginaGeo, type PorPagina, type Rect, type TamanoPagina } from './geometria.ts';
import { capaTemaCatalogo, type CapaCatalogo } from './tema.ts';
import { LOGO_SIMBOLO_HREF } from '../logo.ts';

export const COLORES_CATALOGO = { azul: '#1367A4', celeste: '#4EA8DF', morado: '#9D40CB', texto: '#0A0A0F', gris: '#5B6070', grisClaro: '#7A8094', fondo: '#FFFFFF' } as const;
const MARCA = [COLORES_CATALOGO.azul, COLORES_CATALOGO.celeste, COLORES_CATALOGO.morado];
const F = FUENTE_JAKARTA;
export const TEXTO_SITIO = 'visionsmart.app', TEXTO_INSTAGRAM = '@visionsmart.app', SEPARADOR_PIE = '  ·  ';

export type DatosPortada = { tipo: 'categoria' | 'inventario'; titulo?: string; fecha: string; tema?: TemaCtx | null };
export type DatosCabecera = { categoria: string; primera: boolean; tema?: TemaCtx | null };
export type DatosPie = { pagina: number; fechaPrecios?: string | null; tema?: TemaCtx | null };

/** Envoltura comun: ancho/alto en px (150 dpi), viewBox en pt. */
function svg(wPt: number, hPt: number, defs: string, cuerpo: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxDePt(wPt)}" height="${pxDePt(hPt)}" viewBox="0 0 ${n(wPt)} ${n(hPt)}"><defs>${defs}</defs>${cuerpo}</svg>`;
}
const texto = (x: number, y: number, tam: number, fuente: string, fill: string, s: string, ancla: 'start' | 'middle' | 'end' = 'start', extra = '') =>
  `<text x="${n(x)}" y="${n(y)}" font-family="${fuente}" font-size="${n(tam)}" text-anchor="${ancla}"${extra} fill="${fill}">${esc(s)}</text>`;
const logoImg = (cx: number, cy: number, d: number) => `<image href="${LOGO_SIMBOLO_HREF}" x="${n(cx - d / 2)}" y="${n(cy - d / 2)}" width="${n(d)}" height="${n(d)}" preserveAspectRatio="xMidYMid meet"/>`;

/** Logo (simbolo original + «VISIONSMART» en degradado) cuya CAJA queda en `x..x+w`; devuelve su svg, su caja y su ancho. */
function lockup(x: number, yCentro: number, d: number, conTexto: boolean, idGrad: string): { svg: string; caja: Rect; defs: string } {
  const tam = d * 0.62, esp = tam * 0.06, wTxt = conTexto ? medir('VISIONSMART', 'extrabold', tam, esp) : 0, w = d + (conTexto ? d * 0.22 + wTxt : 0);
  const defs = conTexto ? gradColores(idGrad, MARCA, 0) : '';
  const cuerpo = logoImg(x + d / 2, yCentro, d) + (conTexto ? `<text x="${n(x + d * 1.22)}" y="${n(yCentro + tam * 0.36)}" font-family="${F.extrabold}" font-size="${n(tam)}" letter-spacing="${n(esp)}" fill="url(#${idGrad})">VISIONSMART</text>` : '');
  return { svg: cuerpo, caja: { x, y: yCentro - d / 2, w, h: d }, defs };
}
const pad = (c: Rect, m: number): Caja => ({ x: c.x - m, y: c.y - m, w: c.w + 2 * m, h: c.h + 2 * m });
const conTema = (cuerpo: string, capa: CapaCatalogo) => cuerpo + capa.svg;

// ── PORTADA ─────────────────────────────────────────────────────────────────────
export function portadaZonas(datos: DatosPortada, tamano: TamanoPagina, porPagina: PorPagina = 1): { nombre: string; caja: Caja }[] {
  return portadaInterno(datos, tamano, porPagina).zonas;
}

function portadaInterno(datos: DatosPortada, tamano: TamanoPagina, porPagina: PorPagina) {
  const g = paginaDe(tamano, porPagina), W = g.ancho, H = g.alto, cx = W / 2;
  const esCat = datos.tipo === 'categoria';
  const defs = [gradColores('cpBarra', MARCA, 0), gradColores('cpAcento', MARCA, 0), gradColores('cpWash', [COLORES_CATALOGO.celeste, COLORES_CATALOGO.morado], 45),
    `<radialGradient id="cpLuzA" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${COLORES_CATALOGO.celeste}" stop-opacity="0.22"/><stop offset="1" stop-color="${COLORES_CATALOGO.celeste}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="cpLuzB" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${COLORES_CATALOGO.morado}" stop-opacity="0.2"/><stop offset="1" stop-color="${COLORES_CATALOGO.morado}" stop-opacity="0"/></radialGradient>`];
  const ancho = W * 0.78, alta = g.orientacion === 'vertical';
  // logo: simbolo grande centrado (y, en categoria, el nombre de marca al lado no cabe centrado: va debajo)
  const dLogo = alta ? 104 : 80, yLogo = H * (alta ? 0.27 : 0.26);
  const L = lockup(cx - dLogo / 2, yLogo, dLogo, false, 'cpLogo');
  // titulo
  const lineasT = esCat ? tituloEnLineas(String(datos.titulo ?? ''), ancho, alta ? 58 : 46, 24) : tituloEnLineas('CATÁLOGO VISIONSMART', ancho, alta ? 60 : 48, 28);
  const tam = lineasT.tam, interl = tam * 1.08, yTit = H * (alta ? 0.52 : 0.54) - ((lineasT.lineas.length - 1) * interl) / 2;
  const etiqueta = esCat ? 'CATÁLOGO DE PRODUCTOS' : 'INVENTARIO COMPLETO';
  const yEtq = yTit - tam * 1.22;
  const wMax = Math.max(...lineasT.lineas.map((l) => medir(l, 'extrabold', tam)));
  const yBarra = yTit + (lineasT.lineas.length - 1) * interl + tam * 0.45;
  const yFecha = yBarra + 38, tamFecha = alta ? 17 : 15;
  const yPie = H - 46;
  let cuerpo = `<rect x="0" y="0" width="${n(W)}" height="${n(H)}" fill="${COLORES_CATALOGO.fondo}"/>` +
    `<circle cx="${n(W * 0.92)}" cy="${n(H * 0.06)}" r="${n(W * 0.62)}" fill="url(#cpLuzA)"/><circle cx="${n(W * 0.06)}" cy="${n(H * 0.96)}" r="${n(W * 0.7)}" fill="url(#cpLuzB)"/>` +
    `<rect x="0" y="0" width="${n(W)}" height="${n(g.orientacion === 'vertical' ? 12 : 10)}" fill="url(#cpBarra)"/><rect x="0" y="${n(H - 12)}" width="${n(W)}" height="12" fill="url(#cpBarra)"/>` +
    L.svg +
    texto(cx, yEtq, alta ? 13 : 11, F.bold, COLORES_CATALOGO.gris, etiqueta, 'middle', ' letter-spacing="4"');
  lineasT.lineas.forEach((l, i) => { cuerpo += texto(cx, yTit + i * interl, tam, F.extrabold, i === lineasT.lineas.length - 1 ? 'url(#cpAcento)' : COLORES_CATALOGO.texto, l, 'middle'); });
  cuerpo += `<rect x="${n(cx - 36)}" y="${n(yBarra)}" width="72" height="4" rx="2" fill="url(#cpAcento)"/>` +
    texto(cx, yFecha, tamFecha, F.bold, COLORES_CATALOGO.gris, datos.fecha, 'middle') +
    texto(cx, yPie, alta ? 11 : 10, F.regular, COLORES_CATALOGO.gris, `${TEXTO_SITIO}${SEPARADOR_PIE}${TEXTO_INSTAGRAM}`, 'middle');
  const wFecha = medir(datos.fecha, 'bold', tamFecha), wPie = medir(`${TEXTO_SITIO}${SEPARADOR_PIE}${TEXTO_INSTAGRAM}`, 'regular', alta ? 11 : 10);
  const zonas = [
    { nombre: 'logo', caja: pad(L.caja, 6) },
    { nombre: 'titulo', caja: { x: cx - wMax / 2 - 8, y: yEtq - 16, w: wMax + 16, h: yBarra + 8 - (yEtq - 16) } },
    { nombre: 'fecha', caja: { x: cx - wFecha / 2 - 8, y: yFecha - tamFecha - 4, w: wFecha + 16, h: tamFecha + 12 } },
    { nombre: 'pie', caja: { x: cx - wPie / 2 - 8, y: yPie - 16, w: wPie + 16, h: 26 } },
    { nombre: 'barra-superior', caja: { x: 0, y: 0, w: W, h: 14 } }, { nombre: 'barra-inferior', caja: { x: 0, y: H - 14, w: W, h: 14 } },
  ];
  return { g, defs: defs.join('') + L.defs, cuerpo, zonas, W, H };
}

export function renderPortada(datos: DatosPortada, tamano: TamanoPagina, porPagina: PorPagina = 1): string {
  const p = portadaInterno(datos, tamano, porPagina);
  const capa = capaTemaCatalogo(datos.tema, p.W, p.H, p.zonas, `catalogo-portada-${datos.tipo}`);
  return svg(p.W, p.H, p.defs, conTema(p.cuerpo, capa));
}

// ── CABECERA ────────────────────────────────────────────────────────────────────
function cabeceraInterno(datos: DatosCabecera, tamano: TamanoPagina, porPagina: PorPagina) {
  const g = paginaDe(tamano, porPagina), W = g.ancho, H = g.cabecera.h, mx = g.margenX;
  const defs = [gradColores('ccBarra', MARCA, 0), gradColores('ccLinea', [COLORES_CATALOGO.azul, COLORES_CATALOGO.celeste, 'rgba(157,64,203,0.15)'], 0)];
  // marca pequeña a la derecha (simbolo + VISIONSMART), siempre igual
  const dMini = H * 0.24, wMarca = dMini + dMini * 0.22 + medir('VISIONSMART', 'extrabold', dMini * 0.62, dMini * 0.62 * 0.06);
  const L = lockup(W - mx - wMarca, H * 0.3, dMini, true, 'ccLogo');
  const nombre = String(datos.categoria ?? '').trim();
  let cuerpo = L.svg, zonas: { nombre: string; caja: Caja }[] = [{ nombre: 'logo', caja: pad(L.caja, 4) }];
  const maxAncho = W - 2 * mx - wMarca - 24;
  if (datos.primera) {
    const t0 = nombre.toLocaleUpperCase('es'), tam = tamParaAncho(t0, 'extrabold', maxAncho, H * 0.4, 13), t = recortar(t0, 'extrabold', tam, maxAncho), y = H * 0.62, w = medir(t, 'extrabold', tam);
    cuerpo += texto(mx, y, tam, F.extrabold, COLORES_CATALOGO.texto, t) +
      `<rect x="${n(mx)}" y="${n(y + H * 0.12)}" width="${n(Math.min(64, w))}" height="${n(Math.max(2.5, H * 0.045))}" rx="${n(Math.max(2.5, H * 0.045) / 2)}" fill="url(#ccBarra)"/>` +
      `<circle cx="${n(mx + Math.min(64, w) + 8)}" cy="${n(y + H * 0.12 + Math.max(2.5, H * 0.045) / 2)}" r="1.6" fill="${COLORES_CATALOGO.celeste}"/><circle cx="${n(mx + Math.min(64, w) + 15)}" cy="${n(y + H * 0.12 + Math.max(2.5, H * 0.045) / 2)}" r="1.2" fill="${COLORES_CATALOGO.morado}" fill-opacity="0.7"/>`;
    zonas.push({ nombre: 'titulo', caja: { x: mx - 4, y: y - tam, w: w + 40, h: tam + H * 0.12 + 14 } });
  } else {
    const t0 = nombre.toLocaleUpperCase('es'), tam = Math.min(H * 0.17, tamParaAncho(t0, 'bold', maxAncho, H * 0.17, 8, 1.5)), t = recortar(t0, 'bold', tam, maxAncho - 1.5 * t0.length), y = H * 0.55, w = medir(t, 'bold', tam, 1.5);
    cuerpo += texto(mx, y, tam, F.bold, COLORES_CATALOGO.gris, t, 'start', ' letter-spacing="1.5"') +
      `<rect x="${n(mx)}" y="${n(H * 0.72)}" width="${n(W - 2 * mx)}" height="0.8" fill="url(#ccLinea)"/>`;
    zonas.push({ nombre: 'titulo', caja: { x: mx - 4, y: y - tam - 2, w: w + 12, h: tam + 8 } }, { nombre: 'linea', caja: { x: mx, y: H * 0.72 - 2, w: W - 2 * mx, h: 5 } });
  }
  return { defs: defs.join('') + L.defs, cuerpo, zonas, W, H };
}

export function renderCabecera(datos: DatosCabecera, tamano: TamanoPagina, porPagina: PorPagina = 1): string {
  const p = cabeceraInterno(datos, tamano, porPagina);
  const capa = capaTemaCatalogo(datos.tema, p.W, p.H, p.zonas, `catalogo-cabecera-${datos.primera ? 'primera' : 'normal'}`);
  return svg(p.W, p.H, p.defs, conTema(p.cuerpo, capa));
}
export const cabeceraZonas = (datos: DatosCabecera, tamano: TamanoPagina, porPagina: PorPagina = 1) => cabeceraInterno(datos, tamano, porPagina).zonas;

// ── PIE ─────────────────────────────────────────────────────────────────────────
const TAM_PIE = (h: number) => Math.round(h * 0.135 * 10) / 10;

function pieInterno(datos: DatosPie, tamano: TamanoPagina, porPagina: PorPagina) {
  const g = paginaDe(tamano, porPagina), W = g.ancho, H = g.pie.h, mx = g.margenX, cx = W / 2;
  const defs = gradColores('cfLinea', ['rgba(19,103,164,0.15)', COLORES_CATALOGO.celeste, 'rgba(157,64,203,0.15)'], 0);
  const tam = TAM_PIE(H), y1 = H * 0.46, y2 = H * 0.72;
  const linea = `${TEXTO_SITIO}${SEPARADOR_PIE}${TEXTO_INSTAGRAM}`, wLinea = medir(linea, 'regular', tam), x0 = cx - wLinea / 2;
  const wSitio = medir(TEXTO_SITIO, 'regular', tam), wSep = medir(`${TEXTO_SITIO}${SEPARADOR_PIE}`, 'regular', tam), wInst = medir(TEXTO_INSTAGRAM, 'regular', tam);
  const enlaces = { sitio: { x: x0, y: y1 - tam, w: wSitio, h: tam * 1.35 }, instagram: { x: x0 + wSep, y: y1 - tam, w: wInst, h: tam * 1.35 } };
  const num = String(Math.max(1, Math.round(Number(datos.pagina) || 1))), tamNum = tam * 1.35, wNum = medir(num, 'extrabold', tamNum);
  const fecha = datos.fechaPrecios ? `Precios vigentes al ${datos.fechaPrecios}` : '', tamF = tam * 0.9, wF = fecha ? medir(fecha, 'bold', tamF) : 0;
  let cuerpo = `<rect x="${n(mx)}" y="${n(H * 0.12)}" width="${n(W - 2 * mx)}" height="0.8" fill="url(#cfLinea)"/>` +
    texto(cx, y1, tam, F.regular, COLORES_CATALOGO.gris, linea, 'middle') +
    texto(W - mx, y1 + tamNum * 0.06, tamNum, F.extrabold, COLORES_CATALOGO.texto, num, 'end');
  if (fecha) cuerpo += texto(cx, y2, tamF, F.bold, COLORES_CATALOGO.grisClaro, fecha, 'middle');
  const zonas: { nombre: string; caja: Caja }[] = [
    { nombre: 'enlaces', caja: { x: x0 - 8, y: y1 - tam - 4, w: wLinea + 16, h: tam * 1.5 + 8 } },
    { nombre: 'pagina', caja: { x: W - mx - wNum - 10, y: y1 - tamNum - 4, w: wNum + 14, h: tamNum + 14 } },
    { nombre: 'linea', caja: { x: mx, y: H * 0.12 - 2, w: W - 2 * mx, h: 5 } },
    ...(fecha ? [{ nombre: 'fecha', caja: { x: cx - wF / 2 - 8, y: y2 - tamF - 4, w: wF + 16, h: tamF + 12 } }] : []),
  ];
  return { defs, cuerpo, zonas, W, H, enlaces, g };
}

export function renderPie(datos: DatosPie, tamano: TamanoPagina, porPagina: PorPagina = 1): string {
  const p = pieInterno(datos, tamano, porPagina);
  const semilla = datos.tema ? { ...datos.tema, semilla: `${datos.tema.semilla ?? ''}|p${Math.round(Number(datos.pagina) || 1)}` } : null;
  const capa = capaTemaCatalogo(semilla, p.W, p.H, p.zonas, 'catalogo-pie');
  return svg(p.W, p.H, p.defs, conTema(p.cuerpo, capa));
}
export const pieZonas = (datos: DatosPie, tamano: TamanoPagina, porPagina: PorPagina = 1) => pieInterno(datos, tamano, porPagina).zonas;

/**
 * Rectangulos (en pt, relativos al ORIGEN DE LA PAGINA, no del pie) de «visionsmart.app» y «@visionsmart.app» en el pie, para colocar
 * las anotaciones de enlace del PDF exactamente sobre el texto: https://visionsmart.app y https://instagram.com/visionsmart.app.
 */
export function pieEnlaces(datos: DatosPie, tamano: TamanoPagina, porPagina: PorPagina = 1): { sitio: Rect; instagram: Rect } {
  const p = pieInterno(datos, tamano, porPagina), oy = p.g.pie.y, mover = (r: Rect): Rect => ({ x: Math.round(r.x * 100) / 100, y: Math.round((r.y + oy) * 100) / 100, w: Math.round(r.w * 100) / 100, h: Math.round(r.h * 100) / 100 });
  return { sitio: mover(p.enlaces.sitio), instagram: mover(p.enlaces.instagram) };
}
export const URL_SITIO = 'https://visionsmart.app', URL_INSTAGRAM = 'https://instagram.com/visionsmart.app';