import { miles } from './util.ts';

/** Datos que escribe la persona en el modo promocion (todos opcionales). */
export type DatosPromo = {
  activa: boolean;
  /** Precio promocional en USD. Vacio = se usa el precio normal del producto. */
  precioPromoUsd?: number | null;
  /** Precio anterior en USD (el que se muestra tachado). Vacio = el precio normal del producto, si es mayor que el promo. */
  precioAnteriorUsd?: number | null;
  /** "Solo N unidades". */
  unidades?: number | null;
  /** Fecha de vigencia ISO "YYYY-MM-DD". */
  vigenciaISO?: string | null;
};

export type PromoCalculada = {
  precioUsd: number | null;
  anteriorUsd: number | null;
  descuentoPct: number | null;
  unidades: number | null;
  vigencia: string | null;
};

const num = (x: unknown): number | null => { const n = Number(x); return Number.isFinite(n) && n > 0 ? n : null; };

/** "2026-11-30" -> "30/11/2026"; null si no es una fecha real. */
export function fechaCorta(iso: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? '').trim());
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const dias = [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (mo < 1 || mo > 12 || d < 1 || d > dias[mo - 1]) return null;
  return `${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${y}`;
}

/** Reglas del modo promocion: precio a mostrar, precio tachado, % de descuento, unidades y vigencia validados. */
export function calcularPromo(precioNormalUsd: number | null | undefined, promo: DatosPromo | null | undefined): PromoCalculada | null {
  if (!promo || !promo.activa) return null;
  const normal = num(precioNormalUsd);
  const promoUsd = num(promo.precioPromoUsd);
  const precioUsd = promoUsd ?? normal;
  let anteriorUsd = num(promo.precioAnteriorUsd) ?? (promoUsd != null && normal != null && normal > promoUsd ? normal : null);
  if (anteriorUsd != null && precioUsd != null && !(anteriorUsd > precioUsd)) anteriorUsd = null;     // un "anterior" menor o igual no tiene sentido
  const pct = anteriorUsd != null && precioUsd != null ? Math.round((1 - precioUsd / anteriorUsd) * 100) : null;
  const u = Number(promo.unidades);
  const f = fechaCorta(promo.vigenciaISO);
  return {
    precioUsd,
    anteriorUsd,
    descuentoPct: pct != null && pct >= 1 && pct <= 99 ? pct : null,
    unidades: Number.isInteger(u) && u >= 1 && u <= 9999 ? u : null,
    vigencia: f ? `OFERTA VÁLIDA HASTA EL ${f}` : null,
  };
}

export const textoUnidades = (n: number): string => (n === 1 ? 'SOLO 1 UNIDAD' : `SOLO ${miles(n)} UNIDADES`);