import type { Caracteristica, Garantia } from './datos.ts';
import { LOGO_SIMBOLO_HREF } from './logo.ts';
import { ICONOS } from './iconos.ts';
import type { Ancla, Capa, Fuente, Grad, Layout, Plantilla } from './tipos.ts';
import { textoUnidades, type PromoCalculada } from './promo.ts';
import { esc, medir, n, partirTexto, tamParaAncho } from './util.ts';
import { gradColores, gradLineal, gradRadial } from './grad.ts';
import { capa } from './capas.ts';

/** Todo lo que necesita una primitiva para dibujar. `defs` acumula degradados (ids unicos por SVG). */
export type Dibujo = { W: number; H: number; p: Plantilla; lay: Layout; fu: Fuente; defs: string[]; /** lineas y tamano reales del titulo (los paneles se ajustan a ellos); sin dato se reservan 3 lineas */ tl?: { n: number; tam: number } };

// ── Degradados ──────────────────────────────────────────────────────────────────
// (los degradados viven en grad.ts, que tambien usan las capas decorativas de capas.ts)
export { gradLineal, gradColores, gradRadial };
const fillGrad = (id: string) => `url(#${id})`;

// ── Fondo y adornos ─────────────────────────────────────────────────────────────
export function fondo(d: Dibujo): string {
  d.defs.push(gradLineal('fondo', d.p.fondo));
  return `<rect width="${d.W}" height="${d.H}" fill="${fillGrad('fondo')}"/>`;
}

function halo(d: Dibujo): string {
  const h = d.p.halo;
  if (!h) return '';
  d.defs.push(gradRadial('halo', h.color, h.opacidad));
  const f = d.lay.foto;
  return `<ellipse cx="${n(f.x + f.w / 2)}" cy="${n(f.y + f.h * 0.55)}" rx="${n(f.w * 0.78)}" ry="${n(f.h * 0.62)}" fill="${fillGrad('halo')}"/>`;
}

function adornoNiebla(d: Dibujo): string {
  d.defs.push(gradRadial('niebla', '#FFFFFF', 0.10));
  return `<ellipse cx="${d.W * 0.2}" cy="${d.H * 0.78}" rx="${d.W * 0.6}" ry="${d.H * 0.22}" fill="${fillGrad('niebla')}"/>` +
    `<ellipse cx="${d.W * 0.85}" cy="${d.H * 0.3}" rx="${d.W * 0.5}" ry="${d.H * 0.2}" fill="${fillGrad('niebla')}"/>`;
}

function adornoPuntos(d: Dibujo): string {
  const claro = d.p.logo === 'claro';
  const color = claro ? '#BFE0FF' : '#7C8CC8';
  const out: string[] = [];
  const x0 = d.W - 70, y0 = d.lay.logo.y + d.lay.logo.h + 40;
  for (let c = 0; c < 12; c++) for (let r = 0; r < 6; r++) {
    const dist = Math.sqrt(c * c + r * r) / 12;
    if (dist < 1) out.push(`<circle cx="${n(x0 - c * 24)}" cy="${n(y0 + r * 24)}" r="2.6" fill="${color}" fill-opacity="${n(0.5 * (1 - dist))}"/>`);
  }
  return out.join('');
}

function adornoRayos(d: Dibujo): string {
  d.defs.push(gradLineal('rayo', { angulo: 90, paradas: [[0, '#FFFFFF', 0], [0.5, '#CFE8FF', 0.28], [1, '#FFFFFF', 0]] }));
  const f = d.lay.foto, cy = f.y + f.h * 0.6;
  return `<g transform="rotate(-30 ${d.W / 2} ${n(cy)})"><rect x="-400" y="${n(cy - 20)}" width="${d.W + 800}" height="110" fill="${fillGrad('rayo')}"/><rect x="-400" y="${n(cy + 150)}" width="${d.W + 800}" height="34" fill="${fillGrad('rayo')}"/></g>` +
    `<g transform="rotate(30 ${d.W / 2} ${n(f.y)})"><rect x="-400" y="${n(f.y - 40)}" width="${d.W + 800}" height="70" fill="${fillGrad('rayo')}" opacity="0.7"/></g>`;
}

function adornoSpot(d: Dibujo): string {
  d.defs.push(gradLineal('cono', { angulo: 90, paradas: [[0, '#FFFFFF', 0.34], [0.7, '#CFE0FF', 0.08], [1, '#FFFFFF', 0]] }));
  d.defs.push(gradRadial('spotGlow', '#FFFFFF', 0.5));
  const cx = d.W / 2, f = d.lay.foto;
  return `<polygon points="${n(cx - 90)},0 ${n(cx + 90)},0 ${n(cx + 470)},${n(f.y + f.h)} ${n(cx - 470)},${n(f.y + f.h)}" fill="${fillGrad('cono')}"/>` +
    `<ellipse cx="${cx}" cy="0" rx="260" ry="90" fill="${fillGrad('spotGlow')}"/>`;
}

function adornoNeon(d: Dibujo): string {
  const [c1, c2] = [d.p.acento[0], d.p.acento[d.p.acento.length - 1]];
  d.defs.push(gradLineal('neonA', { angulo: 0, paradas: [[0, c1, 0], [0.5, c1, 0.55], [1, c2, 0]] }));
  d.defs.push(gradLineal('neonB', { angulo: 0, paradas: [[0, c2, 0], [0.5, c2, 0.4], [1, c1, 0]] }));
  const { W, H } = d;
  const barra = (x: number, y: number, w: number, h: number, id: string, op: number) =>
    `<polygon points="${n(x)},${n(y + h)} ${n(x + w)},${n(y + h - w * 0.55)} ${n(x + w)},${n(y - w * 0.55)} ${n(x)},${n(y)}" fill="${fillGrad(id)}" opacity="${op}"/>`;
  return barra(W * 0.45, H * 0.24, W * 0.55, 26, 'neonA', 0.9) + barra(W * 0.30, H * 0.30, W * 0.7, 14, 'neonB', 0.8) +
    barra(W * 0.55, H * 0.62, W * 0.45, 40, 'neonA', 0.55) + barra(W * 0.1, H * 0.84, W * 0.9, 10, 'neonB', 0.7) +
    `<polyline points="${n(W * 0.62)},${n(H * 0.24)} ${n(W * 0.72)},${n(H * 0.32)} ${n(W * 0.62)},${n(H * 0.40)}" fill="none" stroke="${c1}" stroke-opacity="0.7" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function adornoPanel(d: Dibujo): string {
  d.defs.push(gradLineal('panel', { angulo: 60, paradas: [[0, '#0A38D2'], [1, '#2A78FF']] }));
  const { W, H } = d;
  return `<polygon points="${n(W * 0.66)},0 ${W},0 ${W},${H} ${n(W * 0.52)},${H}" fill="${fillGrad('panel')}"/>`;
}

function adornoVidrio(d: Dibujo): string {
  const f = d.lay.foto;
  return `<rect x="${n(f.x + 20)}" y="${n(f.y - 10)}" width="${n(f.w - 40)}" height="${n(f.h + 60)}" rx="64" fill="#FFFFFF" fill-opacity="0.5" stroke="#FFFFFF" stroke-opacity="0.95" stroke-width="2.5"/>` +
    `<rect x="${n(f.x + 40)}" y="${n(f.y + 6)}" width="${n(f.w - 80)}" height="${n(f.h * 0.35)}" rx="48" fill="#FFFFFF" fill-opacity="0.25"/>`;
}

function adornoAros(d: Dibujo): string {
  const [c1, c2] = [d.p.acento[0], d.p.acento[d.p.acento.length - 1]];
  d.defs.push(gradRadial('aroA', c1, 0.35), gradRadial('aroB', c2, 0.32));
  return `<circle cx="${d.W * 0.88}" cy="${d.H * 0.18}" r="${d.W * 0.42}" fill="${fillGrad('aroA')}"/><circle cx="${d.W * 0.1}" cy="${d.H * 0.86}" r="${d.W * 0.46}" fill="${fillGrad('aroB')}"/>`;
}

function adornoEstrellas(d: Dibujo): string {
  const est = (cx: number, cy: number, r: number, op: number) =>
    `<path d="M${n(cx)} ${n(cy - r)}L${n(cx + r * 0.22)} ${n(cy - r * 0.22)}L${n(cx + r)} ${n(cy)}L${n(cx + r * 0.22)} ${n(cy + r * 0.22)}L${n(cx)} ${n(cy + r)}L${n(cx - r * 0.22)} ${n(cy + r * 0.22)}L${n(cx - r)} ${n(cy)}L${n(cx - r * 0.22)} ${n(cy - r * 0.22)}Z" fill="#FFFFFF" fill-opacity="${op}"/>`;
  const f = d.lay.foto;
  return est(f.x + f.w * 0.1, f.y + f.h * 0.2, 22, 0.9) + est(f.x + f.w * 0.92, f.y + f.h * 0.5, 16, 0.8) + est(f.x + f.w * 0.3, f.y + f.h * 0.08, 12, 0.7);
}

function adornoAureola(d: Dibujo): string {
  d.defs.push(gradRadial('aureola', '#FFFFFF', 0.85));
  const f = d.lay.foto;
  return `<ellipse cx="${n(f.x + f.w / 2)}" cy="${n(f.y + f.h * 0.5)}" rx="${n(f.w * 0.85)}" ry="${n(f.h * 0.7)}" fill="${fillGrad('aureola')}"/>`;
}

/** Filete fino con el degradado de marca (azul -> morado) bajo el encabezado: la linea de la plantilla minimalista. */
function adornoFilete(d: Dibujo): string {
  d.defs.push(gradColores('filete', d.p.acento, 0));
  const y = d.lay.logo.y + d.lay.logo.h + 26;
  return `<rect x="60" y="${n(y)}" width="${d.W - 120}" height="3" rx="1.5" fill="${fillGrad('filete')}"/>`;
}

const ADORNOS: Record<string, (d: Dibujo) => string> = {
  filete: adornoFilete,
  niebla: adornoNiebla, puntos: adornoPuntos, rayos: adornoRayos, spot: adornoSpot, neon: adornoNeon,
  panel: adornoPanel, vidrio: adornoVidrio, aros: adornoAros, estrellas: adornoEstrellas, aureola: adornoAureola,
};

/** Adornos de FONDO (todo menos "vidrio", que va justo detras de la foto). */
export function adornosFondo(d: Dibujo): string {
  return d.p.adornos.filter((a) => a !== 'vidrio').map((a) => (ADORNOS[a] ? ADORNOS[a](d) : '')).join('') + halo(d) + (d.p.capas ?? []).map((c) => capa(d, c)).join('');
}
export function adornoDetrasFoto(d: Dibujo): string {
  return d.p.adornos.includes('vidrio') ? ADORNOS.vidrio(d) : '';
}

// ── Podio ───────────────────────────────────────────────────────────────────────
export function podio(d: Dibujo): string {
  const t = d.p.podio;
  if (t.tipo === 'ninguno') {
    const modo = d.p.foto?.sombra ?? 'natural', f = d.lay.foto, cx = f.x + f.w / 2, base = f.y + f.h;
    if (modo === 'ninguna') return '';
    // sombra realista en dos pasos: sombra ambiente ancha y suave + sombra de CONTACTO (mas oscura y estrecha) justo bajo el producto
    d.defs.push(gradRadial('sombraAmb', t.sombra ?? '#2A3060', modo === 'estudio' ? 0.5 : 0.3), gradRadial('sombraCon', '#000000', modo === 'estudio' ? 0.75 : 0.5));
    return `<ellipse cx="${n(cx)}" cy="${n(base + 8)}" rx="${n(f.w * 0.46)}" ry="${n(Math.max(30, f.h * 0.06))}" fill="${fillGrad('sombraAmb')}"/>` +
      `<ellipse cx="${n(cx)}" cy="${n(base + 2)}" rx="${n(f.w * 0.3)}" ry="${n(Math.max(11, f.h * 0.02))}" fill="${fillGrad('sombraCon')}"/>`;
  }
  const { cx, cy, rx, ry } = d.lay.podio;
  const alto = t.tipo === 'cilindro' ? d.lay.podio.alto * 2.6 : d.lay.podio.alto;
  d.defs.push(gradColores('podTapa', t.tapa, 90), gradColores('podCuerpo', t.cuerpo, 90), gradRadial('podSombra', '#000000', 0.45), gradRadial('podBrillo', t.brillo, 0.55));
  if (t.bordeDegradado) d.defs.push(gradColores('podBorde', t.bordeDegradado, 0));
  return `<ellipse cx="${cx}" cy="${n(cy + alto + ry * 0.4)}" rx="${n(rx * 1.12)}" ry="${n(ry * 0.9)}" fill="${fillGrad('podSombra')}"/>` +
    `<ellipse cx="${cx}" cy="${n(cy + alto * 0.3)}" rx="${n(rx * 1.1)}" ry="${n(ry * 1.3)}" fill="${fillGrad('podBrillo')}"/>` +
    `<path d="M${n(cx - rx)} ${n(cy)} L${n(cx - rx)} ${n(cy + alto)} A${n(rx)} ${n(ry)} 0 0 0 ${n(cx + rx)} ${n(cy + alto)} L${n(cx + rx)} ${n(cy)} Z" fill="${fillGrad('podCuerpo')}"/>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fillGrad('podTapa')}" stroke="${t.bordeDegradado ? fillGrad('podBorde') : t.borde}" stroke-width="4" stroke-opacity="0.9"/>` +
    `<ellipse cx="${cx}" cy="${n(cy - ry * 0.12)}" rx="${n(rx * 0.9)}" ry="${n(ry * 0.78)}" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.16"/>`;
}

// ── Foto ────────────────────────────────────────────────────────────────────────
export function foto(d: Dibujo, href: string | null | undefined): string {
  const f = d.lay.foto;
  // la imagen se dibuja SIN deformarse (meet, apoyada abajo y centrada); `rot` la inclina alrededor del centro de su caja
  const rot = d.p.foto?.rot;
  if (href) {
    const img = `<image href="${esc(href)}" x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" preserveAspectRatio="xMidYMax meet"/>`;
    return rot ? `<g transform="rotate(${n(rot)} ${n(f.x + f.w / 2)} ${n(f.y + f.h / 2)})">${img}</g>` : img;
  }
  // sin foto: el simbolo de la marca, tenue
  return `<g opacity="0.22">${simbolo(f.x + f.w / 2, f.y + f.h * 0.5, Math.min(f.w, f.h) * 0.5)}</g>`;
}

// ── Logo ────────────────────────────────────────────────────────────────────────
// 'claro': para fondos oscuros; 'oscuro': para fondos claros; 'pildora': conjunto sobre una pildora blanca, para fondos de color de marca (azul / morado / degradado)
// donde el simbolo (azul-morado) se perderia. En los tres casos el simbolo es el PNG original, sin tocar.
function coloresLogo(v: 'claro' | 'oscuro' | 'pildora'): string[] { return v === 'claro' ? ['#5EC4FF', '#8E7BFF', '#C264F0'] : ['#1367A4', '#4EA8DF', '#9D40CB']; }
/** Relleno extra (px) de la pildora del logo alrededor del conjunto simbolo + texto. */
export const PAD_PILDORA_LOGO = { x: 16, y: 9 } as const;

/** Simbolo de la marca: el logo ORIGINAL (PNG incrustado, src/logo.ts) centrado en (cx, cy) con diametro `h`. El aro toca los bordes de la imagen. */
export function simbolo(cx: number, cy: number, h: number): string {
  return `<image href="${LOGO_SIMBOLO_HREF}" x="${n(cx - h / 2)}" y="${n(cy - h / 2)}" width="${n(h)}" height="${n(h)}" preserveAspectRatio="xMidYMid meet"/>`;
}

/** Simbolo + "VISIONSMART" (ExtraBold, degradado de marca). `ancla` indica de que lado de x queda el conjunto. */
export function logo(d: Dibujo): string {
  const { x, y, h, ancla } = d.lay.logo;
  const tam = h * 0.62, espaciado = tam * 0.06;
  const wTexto = medir('VISIONSMART', 'extrabold', tam, espaciado);
  const total = h + h * 0.22 + wTexto;
  const x0 = ancla === 'end' ? x - total : ancla === 'middle' ? x - total / 2 : x;
  d.defs.push(gradColores('logoTxt', coloresLogo(d.p.logo), 0));
  const pad = PAD_PILDORA_LOGO;
  const pildora = d.p.logo === 'pildora'
    ? `<rect x="${n(x0 - pad.x)}" y="${n(y - pad.y)}" width="${n(total + pad.x * 2)}" height="${n(h + pad.y * 2)}" rx="${n((h + pad.y * 2) / 2)}" fill="#FFFFFF" fill-opacity="0.97"/>` : '';
  return pildora + simbolo(x0 + h / 2, y + h / 2, h) +
    `<text x="${n(x0 + h * 1.22)}" y="${n(y + h / 2 + tam * 0.36)}" font-family="${d.fu.extrabold}" font-size="${n(tam)}" letter-spacing="${n(espaciado)}" fill="${fillGrad('logoTxt')}">VISIONSMART</text>`;
}

// ── Titulo ──────────────────────────────────────────────────────────────────────
export function titulo(d: Dibujo, lineas: string[], tam: number): string {
  const t = d.lay.titulo, p = d.p;
  d.defs.push(gradColores('acento', p.acento, 0));
  const interlineado = tam * 1.06;
  const fam = p.titulo.peso === 'bold' ? d.fu.bold : d.fu.extrabold;
  const txt = (s: string, y: number, fill: string) => `<text x="${t.x}" y="${n(y)}" font-family="${fam}" font-size="${n(tam)}" text-anchor="${t.ancla}" fill="${fill}">${esc(s)}</text>`;
  if (lineas.length === 1) {
    const palabras = lineas[0].split(' ');
    if (palabras.length === 1) return txt(palabras[0], t.y, p.texto);
    const ultima = palabras.pop()!;
    return `<text x="${t.x}" y="${n(t.y)}" font-family="${fam}" font-size="${n(tam)}" text-anchor="${t.ancla}" fill="${p.texto}">${esc(palabras.join(' '))} <tspan fill="${fillGrad('acento')}">${esc(ultima)}</tspan></text>`;
  }
  // varias lineas: las primeras en el color de texto y la ultima con el degradado de acento
  return lineas.map((l, i) => txt(l, t.y + i * interlineado, i === lineas.length - 1 ? fillGrad('acento') : p.texto)).join('');
}
// ── Lista de caracteristicas ────────────────────────────────────────────────────
function iconoSvg(d: Dibujo, id: Caracteristica['icono'], cx: number, cy: number, tam: number): string {
  const e = d.p.icono, esc_ = tam / 24;
  const trazos = ICONOS[id].map((t) => `<path d="${t}"/>`).join('');
  const c = e.estilo === 'circulo' ? `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(tam / 2)}" fill="${e.relleno}" stroke="${e.borde}" stroke-width="2.4"/>` : '';
  const lado = e.estilo === 'circulo' ? tam * 0.52 : tam * 0.7;
  const k = lado / 24;
  void esc_;
  return c + `<g transform="translate(${n(cx - lado / 2)} ${n(cy - lado / 2)}) scale(${n(k)})" fill="none" stroke="${e.color}" stroke-width="${n(e.estilo === 'circulo' ? 1.7 : 1.9)}" stroke-linecap="round" stroke-linejoin="round">${trazos}</g>`;
}

export function lista(d: Dibujo, items: Caracteristica[]): string {
  const L = d.lay.lista, p = d.p;
  const out: string[] = [];
  const rej = L.modo === 'rejilla', gap = 18, colW = rej ? (L.ancho - gap) / 2 : 0;
  items.slice(0, L.cantidad).forEach((it, i) => {
    const fila = L.modo === 'fila';
    let ix = fila ? L.x + i * L.paso : L.x, iy = fila ? L.y : L.y + i * L.paso;
    if (rej) { ix = L.x + (i % 2) * (colW + gap); iy = L.y + Math.floor(i / 2) * (L.pasoY ?? L.paso); }
    // tarjeta (bloque): el icono y el texto van dentro de un recuadro pequeno
    const pad = L.bloque ? 16 : 0, anchoBloque = fila ? L.paso - 20 : rej ? colW : L.ancho, altoBloque = L.icono + pad * 2;
    if (L.bloque) {
      const tj = p.tarjeta ?? { relleno: '#FFFFFF', borde: '#D9DCE6', opRelleno: 1 };
      out.push(`<rect x="${n(ix)}" y="${n(iy)}" width="${n(anchoBloque)}" height="${n(altoBloque)}" rx="16" fill="${tj.relleno}" fill-opacity="${n(tj.opRelleno ?? 1)}" stroke="${tj.borde}" stroke-width="1.6"/>`);
      ix += pad; iy += pad;
    }
    const cx = ix + L.icono / 2, cy = iy + L.icono / 2;
    const xt = ix + L.icono + 16;
    const anchoTexto = L.bloque ? anchoBloque - pad * 2 - L.icono - 16 : (fila ? L.paso - L.icono - 30 : rej ? colW - L.icono - 16 : L.ancho - L.icono - 16);
    const lineas = it.lineas.length === 1 ? partirTexto(it.lineas[0], 'regular', L.tam, anchoTexto, fila ? 3 : 2) : it.lineas.map((s) => partirTexto(s, 'regular', L.tam, anchoTexto, 1)[0]);
    out.push(iconoSvg(d, it.icono, cx, cy, L.icono));
    const y0 = cy - ((lineas.length - 1) * L.tam * 1.2) / 2 + L.tam * 0.34;
    lineas.forEach((s, j) => out.push(`<text x="${n(xt)}" y="${n(y0 + j * L.tam * 1.2)}" font-family="${d.fu.regular}" font-size="${L.tam}" fill="${p.texto}">${esc(s)}</text>`));
  });
  return out.join('');
}

// ── Precio ──────────────────────────────────────────────────────────────────────
/** ¿Color #RRGGBB claro? (luminancia relativa > 0.5). Lo usa el tachado del precio anterior para contrastar con el fondo de la plantilla. */
export function esColorClaro(hex: string): boolean {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const v = parseInt(m[1], 16), c = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((x) => x / 255);
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 0.5;
}

export function precio(d: Dibujo, texto: string | null, etiqueta: string | null, anterior: string | null = null): string {
  if (!texto) return '';
  const P = d.lay.precio, p = d.p;
  d.defs.push(gradColores('precioG', p.precio.color, 0));
  // tamano: el de la zona, sin pasar del ancho disponible (metricas reales)
  const tam = tamParaAncho(texto, 'extrabold', P.ancho, P.tam, Math.round(P.tam * 0.5));
  const xTxt = P.x;
  const out: string[] = [];
  const lblTam = Math.round(tam * 0.27);
  let lblEt = lblTam;                       // tamano de la ETIQUETA: igual que siempre salvo etiquetas tematicas largas (> 12 letras), que se achican hasta caber (junto al anterior si se puede)
  // Precio anterior + etiqueta: en la MISMA linea (OFERTA ... ANTES $x) si caben en el ancho del precio; si no, OFERTA encima del anterior.
  const tamAnt = Math.round(lblTam * 1.35), gap = Math.round(lblTam * 1.1);
  const txtAnt = anterior ? `ANTES ${anterior}` : '';
  const wAnt = anterior ? medir(txtAnt, 'bold', tamAnt) : 0;
  if (etiqueta && etiqueta.length > 12) {
    const solo = (s0: number) => { let s = s0; while (s > 11 && medir(etiqueta, 'bold', s, 3) > P.ancho) s--; return s; };
    lblEt = solo(lblTam);
    if (anterior) { const tope = P.ancho - gap - wAnt; let s = lblEt; while (s > 16 && medir(etiqueta, 'bold', s, 3) > tope) s--; if (s >= 16 && medir(etiqueta, 'bold', s, 3) <= tope) lblEt = s; }      // junto al anterior solo si queda legible (>= 16 px); si no, se apila encima
  }
  const wEt = etiqueta ? medir(etiqueta, 'bold', lblEt, 3) : 0;
  const juntos = !!anterior && !!etiqueta && wEt + gap + wAnt <= P.ancho;
  const apilado = !!anterior && !!etiqueta && !juntos;
  if (p.precio.acento) {
    // filete de acento (degradado de marca) justo bajo el precio: el detalle que lo distingue sin romper la limpieza
    d.defs.push(gradColores('precioAcento', p.precio.acento, 0));
    const wB = Math.round(Math.min(tam * 1.5, P.ancho * 0.5)), xB = P.ancla === 'end' ? xTxt - wB : P.ancla === 'middle' ? xTxt - wB / 2 : xTxt;
    out.push(`<rect x="${n(xB)}" y="${n(P.y + 14)}" width="${wB}" height="6" rx="3" fill="${fillGrad('precioAcento')}"/>`);
  }
  if (p.precio.vidrio) {
    const w = Math.max(medir(texto, 'extrabold', tam), juntos ? wEt + gap + wAnt : Math.max(wEt, wAnt)) + 56;
    const extra = apilado ? Math.round(tamAnt * 1.3) : 0;                                         // una linea mas arriba (OFERTA sobre ANTES)
    const h = tam + lblTam + 64 + extra;
    const x = P.ancla === 'end' ? xTxt - w + 28 : xTxt - 28;
    out.push(`<rect x="${n(x)}" y="${n(P.y - tam - lblTam - 40 - extra)}" width="${n(w)}" height="${n(h)}" rx="30" fill="#FFFFFF" fill-opacity="0.55" stroke="#FFFFFF" stroke-opacity="0.95" stroke-width="2.5"/>`);
  }
  const yEt = P.y - tam * 0.98;
  if (anterior) {
    // precio anterior tachado ("ANTES Bs. 6.400"); el tachado es una linea (text-decoration no es fiable en react-native-svg)
    // Legibilidad por fondo: fondo OSCURO (texto claro) -> texto y tachado blancos; fondo CLARO -> del color de texto oscuro de la plantilla.
    const yAnt = yEt;
    const totalW = juntos ? wEt + gap + wAnt : wAnt;
    const x0 = P.ancla === 'end' ? xTxt - totalW : P.ancla === 'middle' ? xTxt - totalW / 2 : xTxt;
    const xAnt = juntos ? x0 + wEt + gap : P.ancla === 'end' ? xTxt - wAnt : P.ancla === 'middle' ? xTxt - wAnt / 2 : xTxt;
    const colorAnt = esColorClaro(p.texto) ? '#FFFFFF' : p.texto, opAnt = 0.94;
    const grosor = Math.max(3, Math.round(tamAnt * 0.11));
    out.push(`<text x="${n(xAnt)}" y="${n(yAnt)}" font-family="${d.fu.bold}" font-size="${tamAnt}" text-anchor="start" fill="${colorAnt}" fill-opacity="${opAnt}">${esc(txtAnt)}</text>`);
    out.push(`<line x1="${n(xAnt - 4)}" y1="${n(yAnt - tamAnt * 0.32)}" x2="${n(xAnt + wAnt + 4)}" y2="${n(yAnt - tamAnt * 0.32)}" stroke="${colorAnt}" stroke-opacity="${opAnt}" stroke-width="${grosor}" stroke-linecap="round"/>`);
    if (etiqueta) {
      const xEt = juntos ? x0 : xAnt, yEtq = juntos ? yAnt : yAnt - tamAnt * 1.3;                 // apilada: encima del anterior, nunca sobre el precio ni el tachado
      out.push(`<text x="${n(xEt)}" y="${n(yEtq)}" font-family="${d.fu.bold}" font-size="${lblEt}" letter-spacing="3" text-anchor="start" fill="${p.precio.desde}">${esc(etiqueta)}</text>`);
    }
  } else if (etiqueta) out.push(`<text x="${xTxt}" y="${n(yEt)}" font-family="${d.fu.bold}" font-size="${lblEt}" letter-spacing="3" text-anchor="${P.ancla}" fill="${p.precio.desde}">${esc(etiqueta)}</text>`);  out.push(`<text x="${xTxt}" y="${n(P.y)}" font-family="${d.fu.extrabold}" font-size="${tam}" text-anchor="${P.ancla}" fill="${fillGrad('precioG')}">${esc(texto)}</text>`);
  return out.join('');
}

// ── Promocion: chips de descuento / unidades y linea de vigencia ─────────────────
export function promoExtras(d: Dibujo, promo: PromoCalculada): string {
  const out: string[] = [];
  const f = d.lay.foto;
  const cp = d.p.chip;
  const izquierda = cp?.lado ? cp.lado === 'izq' : d.p.familia === 'centrado';   // en centrado el titulo va arriba a un lado; los chips van del lado de la foto
  d.defs.push(gradColores('chipPromo', cp ? cp.relleno : d.p.acento, 0));
  let y = f.y + 8;
  const chip = (texto: string, tam: number, relleno: string, colorTxt: string) => {
    const w = medir(texto, 'extrabold', tam) + 44, h = Math.round(tam * 1.9);
    const x = izquierda ? f.x : f.x + f.w - w;
    out.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${h}" rx="${n(h / 2)}" fill="${relleno}"/>`);
    out.push(`<text x="${n(x + w / 2)}" y="${n(y + h * 0.66)}" font-family="${d.fu.extrabold}" font-size="${tam}" text-anchor="middle" fill="${colorTxt}">${esc(texto)}</text>`);
    y += h + 12;
  };
  if (promo.descuentoPct != null) chip(`-${promo.descuentoPct}%`, Math.round(d.W * 0.05), fillGrad('chipPromo'), cp ? cp.texto : '#FFFFFF');
  if (promo.unidades != null) chip(textoUnidades(promo.unidades), Math.round(d.W * 0.026), 'rgba(0,0,0,0.62)', '#FFFFFF');
  if (promo.vigencia) {
    const P = d.lay.pie, tam = Math.round(d.W * (d.p.familia === 'editorial' ? 0.022 : 0.026));
    // por defecto justo sobre el pie; nunca pegada al precio (si el pie queda muy cerca del precio, baja lo justo para despejarlo)
    const yVig = Math.max(P.y - d.W * 0.034, d.lay.precio.y + 16 + tam * 0.74);
    out.push(`<text x="${P.x}" y="${n(yVig)}" font-family="${d.fu.bold}" font-size="${tam}" letter-spacing="1" text-anchor="${P.ancla}" fill="${d.p.texto}">${esc(promo.vigencia)}</text>`);
  }
  return out.join('');
}

// ── Garantia ────────────────────────────────────────────────────────────────────
export function garantia(d: Dibujo, g: Garantia): string {
  if (!g.tiene) return '';
  const G = d.lay.garantia, e = d.p.garantia;
  const cx = G.x + G.w / 2;
  const t1 = Math.round(G.h * 0.19), t2 = tamParaAncho(g.linea2, 'extrabold', G.w - 36, Math.round(G.h * 0.32), 16);
  if (e.degradado) d.defs.push(gradColores('garG', e.degradado, 0));
  const boton = e.estilo === 'boton';                          // pildora con degradado de marca: la garantia como boton
  return `<rect x="${G.x}" y="${G.y}" width="${G.w}" height="${G.h}" rx="${boton ? n(G.h / 2) : 18}" fill="${e.degradado ? fillGrad('garG') : e.relleno}" stroke="${e.borde}" stroke-width="${e.estilo === 'borde' ? 2.6 : boton ? 1.5 : 2}"${boton ? ' stroke-opacity="0.55"' : ''}/>` +
    (boton ? `<rect x="${n(G.x + G.h * 0.3)}" y="${n(G.y + 5)}" width="${n(G.w - G.h * 0.6)}" height="${n(G.h * 0.3)}" rx="${n(G.h * 0.15)}" fill="#FFFFFF" fill-opacity="0.16"/>` : '') +
    `<text x="${n(cx)}" y="${n(G.y + G.h * 0.36)}" font-family="${d.fu.bold}" font-size="${t1}" letter-spacing="2" text-anchor="middle" fill="${e.textoSec}">${esc(g.linea1)}</text>` +
    `<text x="${n(cx)}" y="${n(G.y + G.h * 0.72)}" font-family="${d.fu.extrabold}" font-size="${t2}" text-anchor="middle" fill="${e.texto}">${esc(g.linea2)}</text>`;
}

// ── Pie ─────────────────────────────────────────────────────────────────────────
export function pie(d: Dibujo, web: string, redes: string): string {
  const P = d.lay.pie;
  return `<text x="${P.x}" y="${P.y}" font-family="${d.fu.regular}" font-size="${Math.round(d.W * (d.p.familia === 'editorial' ? 0.022 : 0.026))}" letter-spacing="1.5" text-anchor="${P.ancla as Ancla}" fill="${d.p.pie}">${esc(web)}  ·  ${esc(redes)}</text>`;
}
