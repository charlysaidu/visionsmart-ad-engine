/**
 * Sistema de TEMAS VISUALES del motor (Navidad, San Valentin, Black Friday, ...).
 * Un tema es una CAPA DECORATIVA que se dibuja SOBRE una plantilla ya terminada: no toca las plantillas ni sus datos.
 * Contrato: renderSvg(..., ctx.tema) -> tras dibujar la plantilla, `definicion.capa()` devuelve el SVG decorativo y las cajas de cada elemento.
 * El motor garantiza por codigo que ninguna caja decorativa invade las ZONAS PROTEGIDAS (producto, precio, logo, titulo, lista, garantia, pie).
 */
import type { Dibujo } from '../primitivas.ts';
import { crearAleatorio } from '../repartir.ts';

export type IdTema = 'navidad';
export type Intensidad = 'sutil' | 'equilibrada' | 'festiva';
export const INTENSIDADES: readonly Intensidad[] = ['sutil', 'equilibrada', 'festiva'];

/** Elementos que el usuario puede mostrar / ocultar (cada tema usa los que le correspondan). */
export type ElementoTema = 'nieve' | 'pino' | 'regalos' | 'luces' | 'arboles' | 'calcetines' | 'sombreros' | 'munecos' | 'montes' | 'destellos' | 'etiquetas';

export type TemaCtx = {
  id: IdTema;
  /** Por defecto 'equilibrada'. */
  intensidad?: Intensidad;
  /** Cambiarla da otra variacion; la misma semilla da SIEMPRE la misma decoracion. */
  semilla?: string | number;
  /** Entra en la semilla (producto + plantilla + semilla). */
  productoId?: number | string | null;
  /** Por defecto todos activos. */
  elementos?: Partial<Record<ElementoTema, boolean>>;
  /** Solo con modo promocion: etiqueta tematica en lugar de «OFERTA». undefined = una de las del tema segun la semilla; null o 'etiquetas' desactivado = «OFERTA». */
  etiquetaPromo?: string | null;
};

export type Caja = { x: number; y: number; w: number; h: number };
export type CajaDecor = { tipo: string; caja: Caja };
export type CapaTema = { svg: string; cajas: CajaDecor[] };
export type ZonaProtegida = { nombre: string; caja: Caja };

export type DefinicionTema = {
  id: IdTema;
  nombre: string;
  /** Para la UI (no entra en ningun SVG). */
  emoji: string;
  elementos: readonly ElementoTema[];
  etiquetasPromo: readonly string[];
  capa(d: Dibujo, tema: TemaCtx, zonas: ZonaProtegida[], plantillaId: string): CapaTema;
};

/** ¿Se cruzan dos cajas (con `margen` px de aire)? Tocar el borde no cuenta como cruzar con margen 0. */
export const intersecta = (a: Caja, b: Caja, margen = 0): boolean =>
  a.x < b.x + b.w + margen && a.x + a.w + margen > b.x && a.y < b.y + b.h + margen && a.y + a.h + margen > b.y;

export const dentroDelLienzo = (c: Caja, W: number, H: number): boolean => c.x >= 0 && c.y >= 0 && c.x + c.w <= W && c.y + c.h <= H;

/** Hash FNV-1a de 32 bits: texto -> entero (la semilla del PRNG sale de producto + plantilla + semilla). */
export function hashSemilla(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

/** PRNG reproducible para una combinacion producto + plantilla + semilla. */
export function prngDe(tema: TemaCtx, plantillaId: string): () => number {
  return crearAleatorio(hashSemilla(`${tema.id}|${tema.productoId ?? ''}|${plantillaId}|${tema.semilla ?? ''}`));
}

export const elementoActivo = (tema: TemaCtx, e: ElementoTema): boolean => tema.elementos?.[e] !== false;