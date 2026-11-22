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