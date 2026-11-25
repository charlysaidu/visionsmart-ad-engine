import type { Grad } from './tipos.ts';
import { n } from './util.ts';

// ── Degradados SVG (ids unicos por documento; los acumula `Dibujo.defs`) ─────────
function vec(angulo: number): string {
  const r = (angulo * Math.PI) / 180, c = Math.cos(r) / 2, s = Math.sin(r) / 2;
  return `x1="${n(0.5 - c)}" y1="${n(0.5 - s)}" x2="${n(0.5 + c)}" y2="${n(0.5 + s)}"`;
}
export function gradLineal(id: string, g: Grad): string {
  const stops = g.paradas.map(([o, c, op]) => `<stop offset="${n(o)}" stop-color="${c}"${op != null ? ` stop-opacity="${n(op)}"` : ''}/>`).join('');
  return `<linearGradient id="${id}" ${vec(g.angulo ?? 0)}>${stops}</linearGradient>`;
}
export function gradColores(id: string, colores: string[], angulo = 0): string {
  const k = Math.max(1, colores.length - 1);
  return gradLineal(id, { angulo, paradas: colores.map((c, i) => [i / k, c] as [number, string]) });
}
export function gradRadial(id: string, color: string, opCentro: number, opBorde = 0): string {
  return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${color}" stop-opacity="${n(opCentro)}"/><stop offset="1" stop-color="${color}" stop-opacity="${n(opBorde)}"/></radialGradient>`;
}
export const fillGrad = (id: string): string => `url(#${id})`;

/** Color #RRGGBB del fondo vertical (angulo 90) de una plantilla a la altura `y` de un lienzo de alto `H` (para el desvanecido del reflejo). */
export function colorFondoEn(g: Grad, y: number, H: number): string {
  const t = Math.min(1, Math.max(0, y / H)), ps = g.paradas;
  const rgb = (h: string) => { const v = parseInt(h.slice(1, 7), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
  let a = ps[0], b = ps[ps.length - 1];
  for (let i = 0; i < ps.length - 1; i++) if (t >= ps[i][0] && t <= ps[i + 1][0]) { a = ps[i]; b = ps[i + 1]; break; }
  const k = b[0] === a[0] ? 0 : (t - a[0]) / (b[0] - a[0]), ca = rgb(a[1]), cb = rgb(b[1]);
  const h2 = (x: number) => Math.round(x).toString(16).padStart(2, '0').toUpperCase();
  return '#' + [0, 1, 2].map((i) => h2(ca[i] + (cb[i] - ca[i]) * k)).join('');
}
