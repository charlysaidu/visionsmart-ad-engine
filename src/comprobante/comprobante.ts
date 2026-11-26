/**
 * COMPROBANTE DE COMPRA (motor 1.3.0): la «nota de entrega premium» que se envia al cliente por correo despues de registrar una venta.
 * Modulo PURO (sin dependencias de plataforma): recibe los datos YA calculados por Sistema PC y devuelve una o varias paginas SVG de A4 vertical
 * (viewBox 1240 × 1754 = A4 a 150 dpi; width/height 2480 × 3508 px = A4 a 300 dpi). Sistema PC las rasteriza a PNG y pdfkit las envuelve en un PDF A4.
 *
 * CONTRATO VISUAL: fondo blanco perla; azul #1367A4, morado #9D3FCB, negro; degradado azul → morado en lo destacado; tipografia Jakarta (Plus Jakarta Sans);
 *   encabezado en dos zonas (logo + «TECNOLOGIA Y ACCESORIOS» / «¡Gracias por tu compra!» + pastilla con check); tira NUMERO DE VENTA (azul) | FECHA (morado);
 *   cuerpo en 2 columnas (cliente + detalle + resumen + total pagado | panel degradado «Resumen de pago»); fila de 3 tarjetas (ENTREGA, ¿NECESITAS AYUDA?, GARANTIA);
 *   condiciones de garantia en letra pequeña; pie negro «VS VISION SMART · Compra segura · sitio».
 * REGLAS: nunca se inventa un dato (lo que no viene, no se dibuja o el bloque se adapta); nunca se reduce un texto a algo ilegible (se parte o se recorta con «...»);
 *   nunca se elimina un producto: si no caben, se reparte en varias hojas con continuacion coherente (hasta 6 por hoja, repartidos de forma pareja).
 * Solo etiquetas SVG permitidas del motor (sin filtros, mascaras ni clipPath). Las fotos llegan como data URI (el motor no descarga nada).
 */
import { AZUL, MORADO, PERLA } from '../paleta.ts';
import { gradColores } from '../primitivas.ts';
import { FUENTE_JAKARTA } from '../tipos.ts';
import { LOGO_SIMBOLO_HREF } from '../logo.ts';
import { esc, medir, n, recortar, tamParaAncho } from '../util.ts';
import { TEXTO_INSTAGRAM, TEXTO_SITIO } from '../catalogo/render.ts';

export type MonedaComprobante = 'USD' | 'Bs';
export type MontoComprobante = { valor: number; moneda: MonedaComprobante };
export type ItemComprobante = {
  nombre: string;
  /** Solo si existe (modelo / compatibilidad). Si no, no se dibuja. */
  modelo?: string | null;
  cantidad: number;
  /** Precio unitario y subtotal de la linea, en la moneda en que se muestran. */
  precioUnitario: MontoComprobante;
  subtotal: MontoComprobante;
  /** Foto del producto como data URI (png/jpg/webp). Sin foto se dibuja un recuadro con el simbolo de la marca. */
  foto?: string | null;
  /** Ej. «6 meses · hasta 26/05/2027» o «Sin garantía». Si no viene, no se dibuja. */
  garantia?: string | null;
};
export type DatosComprobante = {
  /** Ej. «#000000123». */
  numero: string;
  /** Ej. «26 nov 2026». */
  fecha: string;
  /** Ej. «14:32». Opcional. */
  hora?: string | null;
  cliente: { nombre: string; telefono?: string | null; email?: string | null; direccion?: string | null };
  items: ItemComprobante[];
  resumen: {
    subtotal: MontoComprobante;
    delivery?: MontoComprobante | null;
    descuento?: { etiqueta: string; monto: MontoComprobante } | null;
  };
  /** Total pagado: un monto, o dos si el pago es combinado ($ y Bs). */
  total: MontoComprobante[];
  /** Equivalente en la otra moneda (solo si el pago es en Bs o combinado). */
  equivalente?: MontoComprobante | null;
  pago: { metodo: string; lineas?: { metodo: string; monto: MontoComprobante }[] | null };
  entrega: { tipo: 'delivery' | 'pickup' | 'nacional' | 'tienda'; titulo: string; lineas?: string[] };
  garantia: { titulo: string; lineas?: string[] };
  contacto: { instagram?: string | null; correo?: string | null; sitio?: string | null };
};

// ── geometria (unidades del viewBox) ─────────────────────────────────────────
export const COMPROBANTE_ANCHO = 1240, COMPROBANTE_ALTO = 1754, COMPROBANTE_PX = { ancho: 2480, alto: 3508 } as const;
const W = COMPROBANTE_ANCHO, H = COMPROBANTE_ALTO, M = 60;
const COL_I = { x: M, w: 640 }, COL_D = { x: 764, w: 416 };           // 55 % / 37 % + hueco
const CUERPO_Y = 346, CUERPO_B = 1320;                                 // franja del cuerpo
const FILA = 92, ITEM_H = 84;                                          // paso y alto de una fila de producto
const MAX_POR_HOJA = 6;
const CARDS_Y = 1344, CARDS_H = 180;
const COND_Y = 1540, PIE_Y = 1664;

const C = { texto: '#0F172A', gris: '#5B6070', borde: '#E4DFD3', blanco: '#FFFFFF', verde: '#15803D', verdeTexto: '#166534', negro: '#000000' } as const;
const F = FUENTE_JAKARTA;
const MARCA = [AZUL, MORADO];

export const CONDICIONES_GARANTIA = [
  '1. La garantía es válida únicamente dentro del tiempo indicado para cada producto (ver la garantía de cada artículo).',
  '2. El producto debe estar en su caja original y en buen estado (no rota, no mojada, no maltratada).',
  '3. El producto debe estar en buen estado físico: sin golpes, sin humedad, sin quemaduras ni dobleces. La garantía cubre ÚNICAMENTE defectos de fábrica, NO defectos por mal uso o maltrato del producto.',
];

// ── utilidades ───────────────────────────────────────────────────────────────
const sep = (s: string, p: string): string => s.replace(/\B(?=(\d{3})+(?!\d))/g, p);
/** «$1,234.50» / «Bs 1.234,50». */
export function formatoMonto(m: MontoComprobante): string {
  const v = Math.round((Number(m.valor) || 0) * 100) / 100, neg = v < 0, [ent, dec] = Math.abs(v).toFixed(2).split('.');
  return m.moneda === 'Bs' ? `${neg ? '-' : ''}Bs ${sep(ent, '.')},${dec}` : `${neg ? '-' : ''}$${sep(ent, ',')}.${dec}`;
}
const T = (x: number, y: number, tam: number, fuente: string, fill: string, s: string, ancla: 'start' | 'middle' | 'end' = 'start', extra = ''): string =>
  `<text x="${n(x)}" y="${n(y)}" font-family="${fuente}" font-size="${n(tam)}" text-anchor="${ancla}"${extra} fill="${fill}">${esc(s)}</text>`;
const etq = (x: number, y: number, s: string, fill: string = C.gris, ancla: 'start' | 'middle' | 'end' = 'start', tam = 15): string => T(x, y, tam, F.bold, fill, s, ancla, ' letter-spacing="2.4"');
const rr = (x: number, y: number, w: number, h: number, r: number, fill: string, extra = ''): string => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(r)}" fill="${fill}"${extra}/>`;
const tarjeta = (x: number, y: number, w: number, h: number, r = 22): string => rr(x, y, w, h, r, C.blanco, ` stroke="${C.borde}" stroke-width="1.5"`);
const logoImg = (cx: number, cy: number, d: number, extra = ''): string => `<image href="${LOGO_SIMBOLO_HREF}" x="${n(cx - d / 2)}" y="${n(cy - d / 2)}" width="${n(d)}" height="${n(d)}" preserveAspectRatio="xMidYMid meet"${extra}/>`;
/** Texto en hasta `k` lineas: si sobra, la ultima termina en «...». */
function envolver(s: string, peso: 'regular' | 'bold' | 'extrabold', tam: number, ancho: number, k: number): string[] {
  const p = String(s ?? '').trim().split(/\s+/).filter(Boolean), out: string[] = [];
  let actual = '', i = 0;
  for (; i < p.length; i++) {
    const prueba = actual ? actual + ' ' + p[i] : p[i];
    if (medir(prueba, peso, tam) <= ancho) actual = prueba;
    else { if (actual) out.push(actual); actual = p[i]; if (out.length === k) break; }
  }
  if (out.length < k && actual) out.push(actual);
  if (!out.length) return [''];
  const completo = out.join(' ').length >= String(s ?? '').trim().replace(/\s+/g, ' ').length;
  return out.slice(0, k).map((l, j, a) => (j === a.length - 1 && !completo ? recortar(l + '...', peso, tam, ancho) : recortar(l, peso, tam, ancho)));
}

// ── iconos de linea (viewBox 24, solo trazos) ────────────────────────────────
const ICONOS_C = {
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  escudo: ['M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z', 'M8.5 12l2.5 2.5 4.5-5'],
  candado: ['M6 11h12v9H6z', 'M8.5 11V8a3.5 3.5 0 0 1 7 0v3'],
  moto: ['M5.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z', 'M18.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z', 'M8 17.5h7l2.5-6.5H14', 'M14 11l-1.5-4H10', 'M17.5 11l1 6.5'],
  tienda: ['M4 9l1.5-5h13L20 9', 'M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9', 'M5.5 12v8h13v-8', 'M10 20v-4.5h4V20'],
  paquete: ['M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z', 'M3.5 7.5L12 12l8.5-4.5', 'M12 12v9'],
  chat: ['M4 5h16v11H9l-5 4z'],
} as const;
function icono(id: keyof typeof ICONOS_C, cx: number, cy: number, d: number, stroke: string, grosor = 1.9): string {
  const k = d / 24;
  return `<g transform="translate(${n(cx - d / 2)} ${n(cy - d / 2)}) scale(${n(k)})" fill="none" stroke="${stroke}" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round">${ICONOS_C[id].map((p) => `<path d="${p}"/>`).join('')}</g>`;
}
const iconoCirculo = (id: keyof typeof ICONOS_C, cx: number, cy: number, d: number, idGrad: string): string =>
  `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(d / 2)}" fill="url(#${idGrad})"/>` + icono(id, cx, cy, d * 0.52, C.blanco, 2);

// ── paginacion ───────────────────────────────────────────────────────────────
const lineasDireccion = (d: DatosComprobante): string[] => {
  const c = d.cliente, retiro = d.entrega.tipo === 'tienda' || d.entrega.tipo === 'pickup';
  return c.direccion ? envolver(c.direccion, 'bold', 22, COL_I.w - 48, 2) : retiro ? ['Retiro en tienda'] : [];
};
function alturaCliente(d: DatosComprobante): number {
  const c = d.cliente, dir = lineasDireccion(d);
  return 70 + (c.telefono || c.email ? 58 : 0) + (dir.length ? 38 + dir.length * 27 : 0) + 14;
}
/** Cuantos productos lleva cada hoja. Una sola hoja si caben (con el resumen y el total); si no, hojas parejas de hasta 6. Nunca se omite un producto. */
export function repartirProductos(totalItems: number, alturaClienteTarjeta = 186): number[] {
  const n0 = Math.max(0, Math.floor(totalItems));
  const fijoUnica = 30 + alturaClienteTarjeta + 8 + 32 + 10 + 12 + 90 + 8 + 86, capUnica = Math.max(1, Math.floor((CUERPO_B - CUERPO_Y - fijoUnica) / FILA));
  if (n0 <= capUnica) return [n0];
  const hojas = Math.max(2, Math.ceil(n0 / MAX_POR_HOJA)), base = Math.floor(n0 / hojas), extra = n0 % hojas;
  return Array.from({ length: hojas }, (_, i) => base + (i < extra ? 1 : 0));
}

// ── piezas ───────────────────────────────────────────────────────────────────
function encabezado(d: DatosComprobante, hoja: number, hojas: number): string {
  let s = logoImg(M + 38, 118, 76) + T(M + 94, 114, 34, F.extrabold, 'url(#cmpMarca)', 'VISIONSMART', 'start', ' letter-spacing="2"') + etq(M + 96, 144, 'TECNOLOGÍA Y ACCESORIOS', C.gris, 'start', 14);
  const xDer = W - M - 52 - 28, disp = xDer - 560;
  const tam = tamParaAncho('¡Gracias por tu compra!', 'extrabold', disp, 48, 30);
  s += T(xDer, 112, tam, F.extrabold, C.texto, '¡Gracias por tu compra!', 'end');
  s += T(xDer, 146, 21, F.regular, C.gris, hojas > 1 ? `Comprobante de tu pedido · hoja ${hoja} de ${hojas}` : 'Aquí tienes el comprobante de tu pedido', 'end');
  // pastilla vertical con check, esquina superior derecha
  s += rr(W - M - 52, 62, 52, 104, 26, 'url(#cmpVert)') + icono('check', W - M - 26, 114, 30, C.blanco, 3);
  return s;
}
function tira(d: DatosComprobante): string {
  const y = 226, h = 84, mid = W / 2;
  const fecha = d.hora ? `${d.fecha} · ${d.hora}` : d.fecha;
  return tarjeta(M, y, W - 2 * M, h, 24) + `<line x1="${mid}" y1="${y + 18}" x2="${mid}" y2="${y + h - 18}" stroke="${C.borde}" stroke-width="2"/>` +
    etq(M + 34, y + 33, 'NÚMERO DE VENTA') + T(M + 34, y + 69, tamParaAncho(d.numero, 'extrabold', 440, 38, 26), F.extrabold, AZUL, d.numero) +
    etq(mid + 34, y + 33, 'FECHA') + T(mid + 34, y + 69, tamParaAncho(fecha, 'extrabold', 480, 38, 24), F.extrabold, MORADO, fecha);
}
function seccion(x: number, y: number, titulo: string): string {
  return etq(x, y, titulo, AZUL, 'start', 16) + `<rect x="${x}" y="${y + 9}" width="46" height="4" rx="2" fill="url(#cmpMarca)"/>`;
}
function bloqueCliente(d: DatosComprobante, y: number): { svg: string; h: number } {
  const c = d.cliente, x = COL_I.x, w = COL_I.w, pad = 24;
  const hCard = alturaCliente(d);
  let s = seccion(x, y + 14, 'DATOS DEL CLIENTE') + tarjeta(x, y + 30, w, hCard);
  const y0 = y + 30;
  s += T(x + pad, y0 + 46, tamParaAncho(c.nombre || 'Cliente', 'extrabold', w - 2 * pad, 30, 20), F.extrabold, C.texto, c.nombre || 'Cliente');
  let cy = y0 + 72;
  const campo = (xx: number, yy: number, ww: number, rot: string, val: string): string => etq(xx, yy + 6, rot, C.gris, 'start', 14) + T(xx, yy + 32, 22, F.bold, C.texto, recortar(val, 'bold', 22, ww));
  if (c.telefono || c.email) {
    if (c.telefono && c.email) s += campo(x + pad, cy, (w - 3 * pad) * 0.4, 'TELÉFONO', c.telefono) + campo(x + pad + (w - 3 * pad) * 0.4 + pad, cy, (w - 3 * pad) * 0.6, 'CORREO', c.email);
    else s += c.telefono ? campo(x + pad, cy, w - 2 * pad, 'TELÉFONO', c.telefono) : campo(x + pad, cy, w - 2 * pad, 'CORREO', String(c.email));
    cy += 58;
  }
  const dir = lineasDireccion(d);
  if (dir.length) { s += etq(x + pad, cy + 6, 'DIRECCIÓN', C.gris, 'start', 14); dir.forEach((l, i) => { s += T(x + pad, cy + 32 + i * 27, 22, F.bold, C.texto, l); }); }
  return { svg: s, h: 30 + hCard };
}
function fila(it: ItemComprobante, x: number, y: number, w: number): string {
  let s = tarjeta(x, y, w, ITEM_H, 18);
  const fx = x + 8, fy = y + 8, fd = ITEM_H - 16;
  s += rr(fx, fy, fd, fd, 12, PERLA, ` stroke="${C.borde}" stroke-width="1"`);
  if (it.foto) s += `<image href="${esc(it.foto)}" x="${n(fx + 4)}" y="${n(fy + 4)}" width="${n(fd - 8)}" height="${n(fd - 8)}" preserveAspectRatio="xMidYMid meet"/>`;
  else s += logoImg(fx + fd / 2, fy + fd / 2, fd * 0.55, ' opacity="0.35"');
  const tx = x + 8 + fd + 16, wPrecio = 176, wTxt = w - (tx - x) - wPrecio - 22;
  const nombre = envolver(it.nombre || 'Producto', 'bold', 23, wTxt, 2);
  const partes = [it.modelo ? String(it.modelo) : '', it.garantia ? String(it.garantia) : ''].filter(Boolean);
  const sub = nombre.length === 1 ? partes : partes.length ? [partes.join(' · ')] : [];
  const bloqueH = nombre.length * 27 + sub.length * 22 + (sub.length ? 2 : 0), y0 = y + (ITEM_H - bloqueH) / 2;
  nombre.forEach((l, i) => { s += T(tx, y0 + 21 + i * 27, 23, F.bold, C.texto, l); });
  sub.forEach((l, i) => { s += T(tx, y0 + nombre.length * 27 + 18 + i * 22, 16, F.regular, C.gris, recortar(l, 'regular', 16, wTxt)); });
  const px = x + w - 20, st = formatoMonto(it.subtotal);
  s += T(px, y + 38, tamParaAncho(st, 'extrabold', wPrecio, 28, 17), F.extrabold, MORADO, st, 'end');
  const cant = it.cantidad > 1 ? `Cant. ${it.cantidad} × ${formatoMonto(it.precioUnitario)}` : 'Cant. 1';
  s += T(px, y + 62, tamParaAncho(cant, 'regular', wPrecio, 16, 11), F.regular, C.gris, cant, 'end');
  return s;
}
function resumenYTotal(d: DatosComprobante, y: number): string {
  const x = COL_I.x, w = COL_I.w;
  const lineas: [string, string, string][] = [['Subtotal', formatoMonto(d.resumen.subtotal), C.texto]];
  if (d.resumen.delivery) lineas.push(['Delivery', formatoMonto(d.resumen.delivery), C.texto]);
  if (d.resumen.descuento) lineas.push([d.resumen.descuento.etiqueta || 'Descuento', '-' + formatoMonto(d.resumen.descuento.monto).replace(/^-/, ''), C.verdeTexto]);
  let s = `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${C.borde}" stroke-width="2"/>`;
  lineas.forEach(([a, b, col], i) => { const yy = y + 26 + i * 30; s += T(x + 6, yy, 21, F.regular, C.gris, a) + T(x + w - 6, yy, 22, F.bold, col, b, 'end'); });
  const yb = y + 12 + lineas.length * 30 + 8, total = d.total.map(formatoMonto).join('  +  ');
  s += rr(x, yb, w, 86, 24, 'url(#cmpBanda)') + T(x + 30, yb + 52, 22, F.bold, C.blanco, 'TOTAL PAGADO', 'start', ' letter-spacing="2.4"') +
    T(x + w - 30, yb + 56, tamParaAncho(total, 'extrabold', w - 320, 44, 22), F.extrabold, C.blanco, total, 'end');
  return s;
}
function panelPago(d: DatosComprobante): string {
  const x = COL_D.x, y = CUERPO_Y, w = COL_D.w, h = CUERPO_B - CUERPO_Y, pad = 36, wi = w - 2 * pad, cx = x + w / 2;
  let s = rr(x, y, w, h, 34, 'url(#cmpVert)') + logoImg(cx, y + h - 190, 330, ' opacity="0.11"');
  let cy = y + 62;
  s += etq(x + pad, cy, 'RESUMEN DE PAGO', C.blanco, 'start', 18) + `<line x1="${x + pad}" y1="${cy + 22}" x2="${x + w - pad}" y2="${cy + 22}" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="2"/>`;
  cy += 70;
  s += etq(x + pad, cy, 'TOTAL PAGADO', C.blanco, 'start', 15);
  const montos = d.total.map(formatoMonto), tamMax = montos.length > 1 ? 54 : 74;
  montos.forEach((m, i) => { cy += i === 0 ? 74 : 62; s += T(x + pad, cy, tamParaAncho(m, 'extrabold', wi, tamMax, 30), F.extrabold, C.blanco, m); });
  if (d.equivalente) { cy += 40; s += T(x + pad, cy, 21, F.regular, C.blanco, 'Equivalente: ' + formatoMonto(d.equivalente)); }
  cy += 40; s += `<line x1="${x + pad}" y1="${cy}" x2="${x + w - pad}" y2="${cy}" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="2"/>`;
  cy += 44; s += etq(x + pad, cy, 'MÉTODO DE PAGO', C.blanco, 'start', 15);
  envolver(d.pago.metodo || '—', 'extrabold', 30, wi, 2).forEach((l, i) => { cy += i === 0 ? 40 : 36; s += T(x + pad, cy, 30, F.extrabold, C.blanco, l); });
  for (const p of (d.pago.lineas || []).slice(0, 4)) {
    cy += 34; const mm = formatoMonto(p.monto), wm = medir(mm, 'bold', 21);
    s += T(x + pad, cy, 20, F.regular, C.blanco, recortar(p.metodo, 'regular', 20, wi - wm - 14)) + T(x + w - pad, cy, 21, F.bold, C.blanco, mm, 'end');
  }
  cy += 48; s += etq(x + pad, cy, 'ESTADO', C.blanco, 'start', 15);
  cy += 18; s += rr(x + pad, cy, 196, 58, 29, C.verde, ' stroke="#FFFFFF" stroke-opacity="0.85" stroke-width="2"') + icono('check', x + pad + 34, cy + 29, 26, C.blanco, 3) + T(x + pad + 58, cy + 38, 27, F.extrabold, C.blanco, 'PAGADO', 'start', ' letter-spacing="1.5"');
  cy += 58 + 40;
  envolver('Tu pago ha sido procesado exitosamente', 'bold', 22, wi, 3).forEach((l, i) => { s += T(x + pad, cy + i * 30, 22, F.bold, C.blanco, l); });
  return s;
}
function tarjetasInferiores(d: DatosComprobante): string {
  const cw = 354, gap = 29, y = CARDS_Y, h = CARDS_H;
  const x = (i: number) => M + i * (cw + gap);
  const cuerpo = (xx: number, titulo: string, icon: keyof typeof ICONOS_C, principal: string, resto: string[]): string => {
    let s = tarjeta(xx, y, cw, h, 24) + iconoCirculo(icon, xx + 24 + 26, y + 20 + 26, 52, 'cmpIcono') + etq(xx + 92, y + 52, titulo, AZUL, 'start', 16);
    const ancho = cw - 48; let yy = y + 100;
    for (const l of envolver(principal, 'extrabold', 21, ancho, 2)) { s += T(xx + 24, yy, 21, F.extrabold, C.texto, l); yy += 25; }
    for (const l of resto.slice(0, 3)) { if (yy > y + h - 14) break; s += T(xx + 24, yy, 17, F.regular, C.gris, recortar(l, 'regular', 17, ancho)); yy += 22; }
    return s;
  };
  const ico = d.entrega.tipo === 'delivery' ? 'moto' : d.entrega.tipo === 'nacional' ? 'paquete' : 'tienda';
  const ayuda: string[] = [];
  const ct = d.contacto;
  if (ct.instagram) ayuda.push(ct.instagram);
  if (ct.correo) ayuda.push(ct.correo);
  if (ct.sitio) ayuda.push(ct.sitio);
  const [a0, ...aR] = ayuda.length ? ayuda : [TEXTO_SITIO];
  return cuerpo(x(0), 'ENTREGA', ico, d.entrega.titulo, d.entrega.lineas || []) + cuerpo(x(1), '¿NECESITAS AYUDA?', 'chat', a0, aR) + cuerpo(x(2), 'GARANTÍA', 'escudo', d.garantia.titulo, d.garantia.lineas || []);
}
function condiciones(): string {
  let s = etq(M, COND_Y + 18, 'CONDICIONES DE GARANTÍA', C.gris, 'start', 15), y = COND_Y + 42;
  for (const c of CONDICIONES_GARANTIA) for (const l of envolver(c, 'regular', 15.5, W - 2 * M, 2)) { s += T(M, y, 15.5, F.regular, C.gris, l); y += 20; }
  return s;
}
function pie(): string {
  const y = PIE_Y, h = H - PIE_Y, cy = y + h / 2;
  return `<rect x="0" y="${y}" width="${W}" height="${h}" fill="${C.negro}"/><rect x="0" y="${y}" width="${W}" height="4" fill="url(#cmpMarca)"/>` +
    logoImg(M + 26, cy + 2, 52) + T(M + 70, cy + 11, 27, F.extrabold, C.blanco, 'VISION SMART', 'start', ' letter-spacing="2.4"') +
    icono('candado', W / 2 - 78, cy + 2, 30, C.blanco, 2) + T(W / 2 - 52, cy + 10, 22, F.bold, C.blanco, 'Compra segura') +
    T(W - M, cy + 10, 22, F.bold, C.blanco, TEXTO_SITIO, 'end');
}

/** Cuantas hojas tendra el comprobante y cuantos productos lleva cada una. */
export const hojasDeComprobante = (d: DatosComprobante): number[] => repartirProductos(d.items.length, alturaCliente(d));

/** Una pagina SVG por hoja (A4 a 300 dpi). */
export function renderComprobante(d: DatosComprobante): string[] {
  if (!d || !Array.isArray(d.items) || !d.items.length) throw new Error('Comprobante sin productos');
  const reparto = hojasDeComprobante(d), hojas = reparto.length;
  let desde = 0;
  return reparto.map((cant, h) => {
    const items = d.items.slice(desde, desde + cant); desde += cant;
    const primera = h === 0, ultima = h === hojas - 1;
    const defs = [gradColores('cmpMarca', MARCA, 0), gradColores('cmpBanda', MARCA, 0), gradColores('cmpVert', MARCA, 90), gradColores('cmpIcono', MARCA, 45)].join('');
    let cuerpo = `<rect x="0" y="0" width="${W}" height="${H}" fill="${PERLA}"/>` + `<rect x="0" y="0" width="${W}" height="10" fill="url(#cmpMarca)"/>` + encabezado(d, h + 1, hojas) + tira(d);
    let y = CUERPO_Y;
    if (primera) { const c = bloqueCliente(d, y - 10); cuerpo += c.svg; y += c.h + 8; }
    cuerpo += seccion(COL_I.x, y + 14, primera ? 'DETALLE DE COMPRA' : 'DETALLE DE COMPRA (continuación)');
    y += 32;
    items.forEach((it, i) => { cuerpo += fila(it, COL_I.x, y + i * FILA, COL_I.w); });
    y += items.length * FILA;
    if (ultima) cuerpo += resumenYTotal(d, y + 10);
    else cuerpo += T(COL_I.x + COL_I.w, y + 26, 19, F.bold, MORADO, `Continúa en la hoja ${h + 2} →`, 'end');
    cuerpo += panelPago(d) + tarjetasInferiores(d) + condiciones() + pie();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${COMPROBANTE_PX.ancho}" height="${COMPROBANTE_PX.alto}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${cuerpo}</svg>`;
  });
}
