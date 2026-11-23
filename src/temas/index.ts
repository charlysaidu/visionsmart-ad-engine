/** Registro de temas visuales. Para agregar uno (San Valentin, Black Friday, Madres, Padres, Halloween...): crear src/temas/<id>/ con una DefinicionTema y registrarla aqui. */
import type { Dibujo } from '../primitivas.ts';
import type { DefinicionTema, IdTema, TemaCtx, CapaTema } from './_base.ts';
import { TEMA_NAVIDAD, etiquetaNavidad } from './navidad/index.ts';
import { zonasProtegidas } from './zonas.ts';

export * from './_base.ts';
export { zonasProtegidas } from './zonas.ts';
export { ETIQUETAS_PROMO_NAVIDAD } from './navidad/index.ts';

export const TEMAS: Record<IdTema, DefinicionTema> = { navidad: TEMA_NAVIDAD };
export const IDS_TEMAS = Object.keys(TEMAS) as IdTema[];

/** Capa decorativa del tema sobre una plantilla ya dibujada. null = tema desconocido (no se dibuja nada). */
export function capaDeTema(d: Dibujo, tema: TemaCtx, plantillaId: string, conPromo: boolean): CapaTema | null {
  const def = TEMAS[tema.id];
  if (!def) return null;
  return def.capa(d, tema, zonasProtegidas(d, conPromo), plantillaId);
}

/** Etiqueta del modo promocion segun el tema (o la misma si el tema no la cambia). */
export function etiquetaDeTema(tema: TemaCtx, plantillaId: string, actual: string | null): string | null {
  return tema.id === 'navidad' ? etiquetaNavidad(tema, plantillaId, actual) : actual;
}