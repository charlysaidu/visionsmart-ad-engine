import { METRICAS, METRICAS_DESDE } from './metricas.ts';

export type PesoFuente = 'regular' | 'bold' | 'extrabold';

export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Numero con 2 decimales maximo y sin ceros sobrantes, para atributos SVG (determinista, sin notacion cientifica). */
export const n = (x: number): string => String(Math.round(x * 100) / 100);

// ── Precio: mismas reglas que App Cliente (lib/precio.ts) ──────────────────────
const tasaValida = (t: unknown): t is number => typeof t === 'number' && Number.isFinite(t) && t > 0;
/** Bs redondeado al multiplo de 100 mas cercano. */
export const redondearBs = (bs: number): number => Math.round(bs / 100) * 100;
/** 20300 -> "20.300" (sin depender de Intl). */
export const miles = (x: number): string => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export function textoBolivares(precioUsd: number | null | undefined, tasa: number | null | undefined): string | null {
  const usd = Number(precioUsd);
  if (!tasaValida(tasa) || !Number.isFinite(usd) || usd <= 0) return null;
  return `Bs. ${miles(redondearBs(usd * tasa))}`;
}
export function textoDolares(precioUsd: number | null | undefined): string | null {
  const usd = Number(precioUsd);
  if (!Number.isFinite(usd) || usd <= 0) return null;
  return `$${usd.toFixed(2)}`;
}

// ── Medicion de texto con metricas REALES de Plus Jakarta Sans ──────────────────
const ANCHO_DEFECTO = 0.62;
function anchoGlifo(peso: PesoFuente, cp: number): number {
  const m = METRICAS[peso];
  const i = cp - METRICAS_DESDE;
  const v = i >= 0 && i < m.arr.length ? m.arr[i] : m.extra[cp];
  return v == null || v < 0 ? ANCHO_DEFECTO : v;
}
/** Ancho en px de un texto (sin kerning; `espaciado` = letter-spacing en px aplicado tras cada caracter). */
export function medir(texto: string, peso: PesoFuente, tam: number, espaciado = 0): number {
  let em = 0, cuenta = 0;
  for (const ch of texto) { em += anchoGlifo(peso, ch.codePointAt(0)!); cuenta++; }
  return em * tam + espaciado * Math.max(0, cuenta - 1);
}
/** Mayor tamano (<= tamMax, >= tamMin) con el que `texto` cabe en `ancho`. */
export function tamParaAncho(texto: string, peso: PesoFuente, ancho: number, tamMax: number, tamMin: number, espaciado = 0): number {
  for (let t = tamMax; t > tamMin; t -= 1) if (medir(texto, peso, t, espaciado) <= ancho) return t;
  return tamMin;
}

/** Recorta con "..." hasta que quepa en `ancho`. */
export function recortar(texto: string, peso: PesoFuente, tam: number, ancho: number): string {
  if (medir(texto, peso, tam) <= ancho) return texto;
  let s = texto;
  while (s.length > 1 && medir(s + '...', peso, tam) > ancho) s = s.slice(0, -1).trimEnd();
  return s + '...';
}

/** Todas las formas de repartir `palabras` en `k` lineas (en orden). */
function particiones(palabras: string[], k: number): string[][] {
  if (k === 1) return [[palabras.join(' ')]];
  const out: string[][] = [];
  for (let i = 1; i <= palabras.length - (k - 1); i++) {
    const cabeza = palabras.slice(0, i).join(' ');
    for (const resto of particiones(palabras.slice(i), k - 1)) out.push([cabeza, ...resto]);
  }
  return out;
}

/**
 * Titulo en 1 a 3 lineas (mayusculas) que quepan en `ancho`. Usa la menor cantidad de lineas que permita un tamano razonable
 * (1 linea si cabe a >= 75 % del tamano maximo; 2 si cabe a >= 55 %; si no, 3 con tope de 72 %), repartiendo las palabras lo mas parejo posible.
 * Solo recorta con "..." cuando ni con 3 lineas al tamano minimo alcanza.
 */
export function tituloEnLineas(nombre: string, ancho: number, tamMax: number, tamMin: number, peso: PesoFuente = 'extrabold'): { lineas: string[]; tam: number } {
  const palabras = nombre.trim().toLocaleUpperCase('es').split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return { lineas: [''], tam: tamMax };
  const umbral = [0.75, 0.55, 0];
  let ultimo: { lineas: string[]; tam: number } | null = null;
  for (let k = 1; k <= Math.min(3, palabras.length); k++) {
    let mejor: string[] | null = null, mejorAncho = Infinity;
    for (const cand of particiones(palabras, k)) {
      const w = Math.max(...cand.map((l) => medir(l, peso, 100)));
      if (w < mejorAncho) { mejorAncho = w; mejor = cand; }
    }
    if (!mejor) continue;
    const tam = Math.min(tamMax, Math.floor((ancho / mejorAncho) * 100));
    const piso = k === Math.min(3, palabras.length) ? Math.round(tamMin * 0.8) : tamMin;
    const t = k === 3 ? Math.max(piso, Math.min(tam, Math.round(tamMax * 0.72))) : Math.max(piso, tam);
    ultimo = { lineas: mejor.map((l) => recortar(l, peso, t, ancho)), tam: t };
    if (tam >= Math.max(tamMin, tamMax * umbral[k - 1]) || k === Math.min(3, palabras.length)) return ultimo;
  }
  return ultimo ?? { lineas: [recortar(palabras.join(' '), peso, tamMin, ancho)], tam: tamMin };
}
/** Parte un texto en hasta `lineas` renglones de como maximo `ancho` px (palabras completas; la ultima se corta con "..."). */
export function partirTexto(texto: string, peso: PesoFuente, tam: number, ancho: number, lineas = 2): string[] {
  const palabras = texto.trim().split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let actual = '';
  for (const w of palabras) {
    if (!actual) actual = w;
    else if (medir(actual + ' ' + w, peso, tam) <= ancho) actual += ' ' + w;
    else { out.push(actual); actual = w; }
  }
  if (actual) out.push(actual);
  if (out.length > lineas) {
    const ult = out.slice(lineas - 1).join(' ');
    return [...out.slice(0, lineas - 1), recortar(ult, peso, tam, ancho)];
  }
  return out.map((l) => recortar(l, peso, tam, ancho));
}