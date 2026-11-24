/**
 * Capa de TEMA (p. ej. Navidad) sobre las piezas del catalogo (portada / cabecera / pie), con la MISMA garantia de zonas protegidas que las imagenes:
 * la decoracion solo se acepta fuera de las cajas de texto y de logo de la pieza. Reutiliza la capa del tema de las plantillas: se dibuja en un lienzo
 * virtual de 1080 px de ancho (donde estan calibrados los elementos) y se escala a los puntos de la pagina.
 */
import type { Dibujo } from '../primitivas.ts';
import { FUENTE_JAKARTA } from '../tipos.ts';
import { TEMAS, type Caja, type CajaDecor, type TemaCtx } from '../temas/index.ts';

const ANCHO_VIRTUAL = 1080;

/** Zonas protegidas y cajas decorativas, en pt. */
export type CapaCatalogo = { svg: string; cajas: CajaDecor[] };

export function capaTemaCatalogo(tema: TemaCtx | null | undefined, wPt: number, hPt: number, zonasPt: { nombre: string; caja: Caja }[], pieza: string): CapaCatalogo {
  const vacio: CapaCatalogo = { svg: '', cajas: [] };
  if (!tema || !tema.id) return vacio;
  const def = TEMAS[tema.id];
  if (!def) return vacio;
  const k = wPt / ANCHO_VIRTUAL, Hv = (ANCHO_VIRTUAL * hPt) / wPt;
  // pseudo-lienzo: solo se usan W, H y el color de texto (fondo claro del catalogo); sin garantia (el sombrero va a una esquina)
  const d = { W: ANCHO_VIRTUAL, H: Hv, p: { texto: '#0A0A0F', familia: 'clasico' }, lay: { garantia: { x: -5000, y: -5000, w: 1, h: 1 } }, fu: FUENTE_JAKARTA, defs: [] } as unknown as Dibujo;
  const zonasV = zonasPt.map((z) => ({ nombre: z.nombre, caja: { x: z.caja.x / k, y: z.caja.y / k, w: z.caja.w / k, h: z.caja.h / k } }));
  const capa = def.capa(d, tema, zonasV, pieza);
  if (!capa.svg) return vacio;
  return {
    svg: `<g transform="scale(${Math.round(k * 1e6) / 1e6})">${capa.svg}</g>`,
    cajas: capa.cajas.map((c) => ({ tipo: c.tipo, caja: { x: Math.round(c.caja.x * k * 100) / 100, y: Math.round(c.caja.y * k * 100) / 100, w: Math.round(c.caja.w * k * 100) / 100, h: Math.round(c.caja.h * k * 100) / 100 } })),
  };
}
