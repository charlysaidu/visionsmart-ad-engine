/**
 * CAPAS DECORATIVAS de las plantillas (motor 1.0.0): luces ambientales, lineas geometricas, bandas diagonales, aros, paneles de cristal,
 * aro de piso y reflejo del producto. Todo son formas SVG simples con degradados (sin filtros, mascaras ni recortes) para que
 * Chromium (Sistema PC) y react-native-svg (App Finanzas) dibujen exactamente lo mismo.
 * Las posiciones son fracciones del lienzo o de la caja de la foto, asi valen en los 3 formatos.
 */
import type { Capa, RefCapa, RefPanel } from './tipos.ts';
import type { Dibujo } from './primitivas.ts';
import { colorFondoEn, fillGrad, gradColores, gradLineal, gradRadial } from './grad.ts';
import { esc, n } from './util.ts';

type Caja = { x: number; y: number; w: number; h: number };

const refCaja = (d: Dibujo, r: RefCapa | undefined): Caja => { const f = d.lay.foto; return r === 'foto' ? { x: f.x, y: f.y, w: f.w, h: f.h } : { x: 0, y: 0, w: d.W, h: d.H }; };
/** Id unico dentro del documento: el numero de definiciones ya acumuladas (cada id se calcula justo antes de su unico push). */
const nid = (d: Dibujo, base: string): string => `${base}${d.defs.length}`;

/** Caja (px) de una zona del layout; los paneles de cristal se ajustan a ella. */
export function cajaDeZona(d: Dibujo, ref: RefPanel): Caja {
  const L = d.lay;
  switch (ref) {
    case 'foto': return { ...L.foto };
    case 'garantia': return { x: L.garantia.x, y: L.garantia.y, w: L.garantia.w, h: L.garantia.h };
    case 'lienzo': return { x: 0, y: 0, w: d.W, h: d.H };
    case 'lista': {
      const li = L.lista, c = Math.max(1, li.cantidad), pad = li.bloque ? 0 : 0;
      if (li.modo === 'fila') return { x: li.x, y: li.y, w: li.ancho, h: li.icono + (li.bloque ? 32 : 0) + pad };
      if (li.modo === 'rejilla') return { x: li.x, y: li.y, w: li.ancho, h: (Math.ceil(c / 2) - 1) * (li.pasoY ?? li.paso) + li.icono + (li.bloque ? 32 : 0) };
      return { x: li.x, y: li.y, w: li.ancho, h: (c - 1) * li.paso + li.icono + (li.bloque ? 32 : 0) };
    }
    case 'precio': {
      const P = L.precio, x = P.ancla === 'end' ? P.x - P.ancho : P.ancla === 'middle' ? P.x - P.ancho / 2 : P.x;
      return { x, y: P.y - P.tam * 1.32, w: P.ancho, h: P.tam * 1.32 + 26 };
    }
    case 'titulo': {
      const t = L.titulo, x = t.ancla === 'end' ? t.x - t.ancho : t.ancla === 'middle' ? t.x - t.ancho / 2 : t.x;
      const lineas = d.tl?.n ?? 3, tam = d.tl?.tam ?? t.tamMax;
      return { x, y: t.y - tam * 0.9, w: t.ancho, h: tam * 0.9 + (lineas - 1) * tam * 1.06 + tam * 0.3 };
    }
  }
}

/** Una capa decorativa -> SVG. Deterministas: sin azar ni reloj. */
export function capa(d: Dibujo, c: Capa): string {
  const esc1 = d.W / 1080;                                       // escala de las medidas en px definidas para el 4x5
  const es45 = Math.abs(d.H / d.W - 1.25) < 1e-6;
  if ((c.solo === '4x5' && !es45) || (c.solo === 'otros' && es45)) return '';
  switch (c.t) {
    case 'luz': {
      const R = refCaja(d, c.ref), id = nid(d, 'luz');
      d.defs.push(gradRadial(id, c.color, c.op));
      const rx = c.rx * R.w, ry = c.ry != null ? c.ry * R.h : rx;
      return `<ellipse cx="${n(R.x + c.x * R.w)}" cy="${n(R.y + c.y * R.h)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fillGrad(id)}"/>`;
    }
    case 'marco': {
      // cuatro esquinas finas: arriba-izq y abajo-der con el primer color; las otras dos con el ultimo (el degradado de marca en las esquinas)
      const R = refCaja(d, c.ref), g = c.grosor ?? 3, L = c.largo * esc1, i = c.inset * esc1;
      const x1 = R.x + i, y1 = R.y + i, x2 = R.x + R.w - i, y2 = R.y + R.h - i, a = c.color[0], b = c.color[c.color.length - 1];
      const esq = (x: number, y: number, sx: number, sy: number, col: string) =>
        `<polyline points="${n(x)},${n(y + sy * L)} ${n(x)},${n(y)} ${n(x + sx * L)},${n(y)}" fill="none" stroke="${col}" stroke-opacity="${n(c.op)}" stroke-width="${g}" stroke-linecap="round" stroke-linejoin="round"/>`;
      return esq(x1, y1, 1, 1, a) + esq(x2, y1, -1, 1, b) + esq(x1, y2, 1, -1, b) + esq(x2, y2, -1, -1, a);
    }
    case 'linea': {
      const R = refCaja(d, c.ref), x1 = R.x + c.x1 * R.w, y1 = R.y + c.y1 * R.h, x2 = R.x + c.x2 * R.w, y2 = R.y + c.y2 * R.h;
      const L = Math.hypot(x2 - x1, y2 - y1), ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI, g = c.grosor ?? 2, id = nid(d, 'lin');
      const k = c.color.length;
      d.defs.push(gradLineal(id, { angulo: 0, paradas: [[0, c.color[0], 0], ...c.color.map((col, i) => [0.2 + (0.6 * i) / Math.max(1, k - 1), col, c.op] as [number, string, number]), [1, c.color[k - 1], 0]] }));
      return `<rect x="${n(x1)}" y="${n(y1 - g / 2)}" width="${n(L)}" height="${n(g)}" fill="${fillGrad(id)}" transform="rotate(${n(ang)} ${n(x1)} ${n(y1)})"/>`;
    }
    case 'banda': {
      const L = c.largo * esc1, g = c.grosor * esc1, cx = c.x * d.W, cy = c.y * d.H, id = nid(d, 'ban'), k = c.color.length;
      d.defs.push(gradLineal(id, { angulo: 0, paradas: [[0, c.color[0], 0], ...c.color.map((col, i) => [0.18 + (0.64 * i) / Math.max(1, k - 1), col, c.op] as [number, string, number]), [1, c.color[k - 1], 0]] }));
      return `<rect x="${n(cx - L / 2)}" y="${n(cy - g / 2)}" width="${n(L)}" height="${n(g)}" fill="${fillGrad(id)}" transform="rotate(${n(c.angulo)} ${n(cx)} ${n(cy)})"/>`;
    }
    case 'aro': {
      const R = refCaja(d, c.ref), id = nid(d, 'aro');
      d.defs.push(gradColores(id, c.color, 0));
      const rx = c.r * R.w, ry = c.ry != null ? c.ry * R.w : rx;
      return `<ellipse cx="${n(R.x + c.x * R.w)}" cy="${n(R.y + c.y * R.h)}" rx="${n(rx)}" ry="${n(ry)}" fill="none" stroke="${fillGrad(id)}" stroke-opacity="${n(c.op)}" stroke-width="${c.grosor ?? 3}"/>`;
    }
    case 'disco': {
      const R = refCaja(d, c.ref), id = nid(d, 'dis');
      d.defs.push(gradRadial(id, c.color, c.op, c.opBorde ?? 0));
      return `<circle cx="${n(R.x + c.x * R.w)}" cy="${n(R.y + c.y * R.h)}" r="${n(c.r * R.w)}" fill="${fillGrad(id)}"/>`;
    }
    case 'poli': {
      const pts = c.pts.map(([x, y]) => `${n(x * d.W)},${n(y * d.H)}`).join(' ');
      return `<polygon points="${pts}" fill="${c.relleno}" fill-opacity="${n(c.op)}"${c.trazo ? ` stroke="${c.trazo}" stroke-opacity="${n(c.opTrazo ?? 0.5)}" stroke-width="${c.grosor ?? 2}" stroke-linejoin="round"` : ''}/>`;
    }
    case 'puntos': {
      const out: string[] = [], paso = c.paso * esc1, x0 = c.x * d.W, y0 = c.y * d.H;
      for (let i = 0; i < c.cols; i++) for (let j = 0; j < c.filas; j++) out.push(`<circle cx="${n(x0 + i * paso)}" cy="${n(y0 + j * paso)}" r="${c.r ?? 2.4}" fill="${c.color}" fill-opacity="${n(c.op)}"/>`);
      return out.join('');
    }
    case 'panel': {
      // superficie de cristal: relleno translucido + borde con degradado de marca + reflejo suave arriba + filo interior
      const z = cajaDeZona(d, c.ref), x = z.x - c.pad, y = z.y - c.pad, w = z.w + c.pad * 2, h = z.h + c.pad * 2;
      const gb = nid(d, 'pb'); d.defs.push(gradColores(gb, c.borde, 45));
      const gr = nid(d, 'pr'); d.defs.push(gradLineal(gr, { angulo: 90, paradas: [[0, '#FFFFFF', c.brillo ?? 0.2], [1, '#FFFFFF', 0]] }));
      return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${c.rx}" fill="${c.relleno}" fill-opacity="${n(c.opRelleno)}" stroke="${fillGrad(gb)}" stroke-opacity="${n(c.opBorde)}" stroke-width="2.2"/>` +
        `<rect x="${n(x + 2)}" y="${n(y + 2)}" width="${n(w - 4)}" height="${n(h * 0.5)}" rx="${Math.max(4, c.rx - 2)}" fill="${fillGrad(gr)}"/>` +
        `<rect x="${n(x + 6)}" y="${n(y + 6)}" width="${n(w - 12)}" height="${n(h - 12)}" rx="${Math.max(4, c.rx - 6)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="1.2"/>`;
    }
    case 'onda': {
      // senoide muestreada cada ~27 px: trazo con degradado de marca y, si se pide, area teñida que se desvanece hacia abajo / arriba
      const y0 = c.y * d.H, A = c.amp * d.H, L = Math.max(60, c.largo * d.W), ph = (c.fase ?? 0) * 2 * Math.PI, N = Math.ceil((d.W + 80) / 27), pts: string[] = [];
      for (let i = 0; i <= N; i++) { const x = -40 + (i * (d.W + 80)) / N; pts.push(`${n(x)} ${n(y0 + A * Math.sin((2 * Math.PI * x) / L + ph))}`); }
      const gs = nid(d, 'on'); d.defs.push(gradColores(gs, c.color, 0));
      let out = '';
      if (c.relleno) {
        const gr = nid(d, 'or'), col = c.color[Math.floor(c.color.length / 2)], abajo = c.relleno === 'abajo';
        d.defs.push(gradLineal(gr, { angulo: 90, paradas: [[0, col, abajo ? (c.opRelleno ?? 0.25) : 0], [1, col, abajo ? 0 : (c.opRelleno ?? 0.25)]] }));
        const borde = abajo ? Math.min(d.H + 10, y0 + A + d.H * 0.22) : Math.max(-10, y0 - A - d.H * 0.22);
        out += `<path d="M${pts.join(' L')} L${n(d.W + 40)} ${n(borde)} L-40 ${n(borde)} Z" fill="${fillGrad(gr)}"/>`;
      }
      return out + `<path d="M${pts.join(' L')}" fill="none" stroke="${fillGrad(gs)}" stroke-opacity="${n(c.op)}" stroke-width="${c.grosor ?? 3}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case 'rejilla': {
      const paso = c.paso * esc1, x0 = c.x0 * d.W, x1 = c.x1 * d.W, y0 = c.y0 * d.H, y1 = c.y1 * d.H, seg: string[] = [];
      for (let x = x0; x <= x1 + 0.1; x += paso) seg.push(`M${n(x)} ${n(y0)} L${n(x)} ${n(y1)}`);
      for (let y = y0; y <= y1 + 0.1; y += paso) seg.push(`M${n(x0)} ${n(y)} L${n(x1)} ${n(y)}`);
      return `<path d="${seg.join(' ')}" fill="none" stroke="${c.color}" stroke-opacity="${n(c.op)}" stroke-width="${c.grosor ?? 1}"/>`;
    }
    case 'hex': {
      const R = refCaja(d, c.ref), cx = R.x + c.x * R.w, cy = R.y + c.y * R.h, r = c.r * R.w, pts: string[] = [];
      for (let k = 0; k < 6; k++) { const a = ((c.rot ?? 0) + 60 * k - 90) * (Math.PI / 180); pts.push(`${n(cx + r * Math.cos(a))},${n(cy + r * Math.sin(a))}`); }
      let trazo = '';
      if (c.trazo) { const gh = nid(d, 'hx'); d.defs.push(gradColores(gh, c.trazo, 45)); trazo = ` stroke="${fillGrad(gh)}" stroke-opacity="${n(c.opTrazo ?? 0.7)}" stroke-width="${c.grosor ?? 2}" stroke-linejoin="round"`; }
      return `<polygon points="${pts.join(' ')}" fill="${c.relleno ?? 'none'}" fill-opacity="${n(c.relleno ? (c.opRelleno ?? 0.08) : 0)}"${trazo}/>`;
    }
    case 'borde': {
      const i = c.inset * esc1, y1 = c.hasta != null ? c.hasta * (d.H / 1350) : d.H - i, gb = nid(d, 'bf'); d.defs.push(gradColores(gb, c.color, 45));
      const g = c.grosor ?? 2;
      return `<rect x="${n(i)}" y="${n(i)}" width="${n(d.W - 2 * i)}" height="${n(y1 - i)}" rx="${c.rx}" fill="none" stroke="${fillGrad(gb)}" stroke-opacity="${n(c.op * 0.2)}" stroke-width="${g * 6}"/>` +
        `<rect x="${n(i)}" y="${n(i)}" width="${n(d.W - 2 * i)}" height="${n(y1 - i)}" rx="${c.rx}" fill="none" stroke="${fillGrad(gb)}" stroke-opacity="${n(c.op)}" stroke-width="${g}"/>`;
    }
    case 'piso': {
      // aro de piso bajo el producto: resplandor + dos aros luminosos con el degradado de marca (plataforma ligera de estudio)
      const f = d.lay.foto, cx = f.x + f.w / 2, cy = f.y + f.h, rx = (c.ancho * f.w) / 2, ry = (c.alto * f.w) / 2;
      const gg = nid(d, 'pg'); d.defs.push(gradRadial(gg, c.color[0], c.op * 0.55));
      const gs = nid(d, 'ps'); d.defs.push(gradColores(gs, c.color, 0));
      const g = c.grosor ?? 3;
      return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx * 1.25)}" ry="${n(ry * 2.2)}" fill="${fillGrad(gg)}"/>` +
        `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="none" stroke="${fillGrad(gs)}" stroke-opacity="${n(c.op)}" stroke-width="${g}"/>` +
        `<ellipse cx="${n(cx)}" cy="${n(cy + ry * 0.45)}" rx="${n(rx * 0.74)}" ry="${n(ry * 0.62)}" fill="none" stroke="${fillGrad(gs)}" stroke-opacity="${n(c.op * 0.5)}" stroke-width="${n(g * 0.6)}"/>`;
    }
  }
}

/**
 * Reflejo del producto en el piso: la MISMA imagen volteada bajo su base y atenuada, con un velo del color del fondo que la
 * desvanece hacia abajo. Solo para fondos verticales (degradado a 90 grados). Se dibuja justo despues del fondo, antes de las luces.
 */
export function reflejoFoto(d: Dibujo, href: string | null | undefined): string {
  const op = d.p.foto?.reflejo;
  if (!op || !href || (d.p.fondo.angulo ?? 0) !== 90) return '';
  const f = d.lay.foto, base = f.y + f.h, alto = Math.min(f.h, d.H - base);
  const c0 = colorFondoEn(d.p.fondo, base, d.H), c1 = colorFondoEn(d.p.fondo, base + alto * 0.5, d.H), gv = nid(d, 'rf');
  // el velo cubre TODO el reflejo: casi transparente junto a la base y totalmente opaco a la mitad, asi el reflejo se funde con el fondo
  d.defs.push(gradLineal(gv, { angulo: 90, paradas: [[0, c0, 0.45], [0.22, c0, 0.88], [0.5, c1, 1], [1, c1, 1]] }));
  return `<g transform="translate(0 ${n(2 * base)}) scale(1 -1)" opacity="${n(op)}"><image href="${esc(href)}" x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" preserveAspectRatio="xMidYMax meet"/></g>` +
    `<rect x="0" y="${n(base)}" width="${d.W}" height="${n(alto)}" fill="${fillGrad(gv)}"/>`;
}
