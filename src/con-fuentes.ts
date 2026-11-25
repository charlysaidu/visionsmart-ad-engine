import { renderSvg } from './index.ts';
import { cssFuentesIncrustadas } from './incrustadas.ts';
import type { ContextoAnuncio, Formato, PlantillaId } from './tipos.ts';

/**
 * Para rasterizadores con soporte de @font-face (Chromium/Electron en Sistema PC): el mismo SVG con las 3 fuentes Plus Jakarta
 * incrustadas como data URI base64 (~370 KB), sin depender de fuentes instaladas. NO usar en react-native-svg (no soporta @font-face).
 */
export function renderSvgConFuentes(id: PlantillaId, ctx: ContextoAnuncio, formato: Formato): string {
  const svg = renderSvg(id, ctx, formato);
  const i = svg.indexOf('>') + 1;                       // justo despues de la etiqueta <svg ...>
  return svg.slice(0, i) + cssFuentesIncrustadas() + svg.slice(i);
}
export { cssFuentesIncrustadas } from './incrustadas.ts';

// ── Catalogo PDF: las mismas fuentes incrustadas para portada / cabecera / pie (Chromium/Electron) ──
import { renderPortada, renderCabecera, renderPie, type DatosPortada, type DatosCabecera, type DatosPie, type TamanoPagina, type PorPagina } from './catalogo/index.ts';
/** Inserta las 3 fuentes Plus Jakarta (data URI) justo despues de la etiqueta <svg ...>. */
export function incrustarFuentesSvg(svg: string): string { const i = svg.indexOf('>') + 1; return svg.slice(0, i) + cssFuentesIncrustadas() + svg.slice(i); }
export const renderPortadaConFuentes = (d: DatosPortada, t: TamanoPagina, p: PorPagina = 1): string => incrustarFuentesSvg(renderPortada(d, t, p));
export const renderCabeceraConFuentes = (d: DatosCabecera, t: TamanoPagina, p: PorPagina = 1): string => incrustarFuentesSvg(renderCabecera(d, t, p));
export const renderPieConFuentes = (d: DatosPie, t: TamanoPagina, p: PorPagina = 1): string => incrustarFuentesSvg(renderPie(d, t, p));

// ── Catalogo BORDE A BORDE (0.9.0): portada y separador oscuros de hoja completa y pie translucido, con las mismas fuentes incrustadas ──
import { renderPortadaBorde, renderSeparadorBorde, renderPieBorde, type DatosPortadaBorde, type DatosSeparadorBorde, type DatosPieBorde } from './catalogo/index.ts';
export const renderPortadaBordeConFuentes = (d: DatosPortadaBorde): string => incrustarFuentesSvg(renderPortadaBorde(d));
export const renderSeparadorBordeConFuentes = (d: DatosSeparadorBorde): string => incrustarFuentesSvg(renderSeparadorBorde(d));
export const renderPieBordeConFuentes = (d: DatosPieBorde): string => incrustarFuentesSvg(renderPieBorde(d));
