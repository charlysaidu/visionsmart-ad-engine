/**
 * BYTES de la fuente de marca (Plus Jakarta Sans) para quien dibuja con ella fuera de un SVG (p. ej. PDFKit en Sistema PC: indice, enlaces, metadatos).
 * FORMATO: TTF (TrueType, cabecera 0x00010000), las mismas 3 TTF que usan las plantillas. Se decodifican una sola vez, al primer acceso.
 * SOLO PARA SISTEMA PC: depende de incrustadas.ts (~370 KB de base64), que NO se empaqueta en el telefono (el sync de Finanzas lo omite).
 *   doc.registerFont(FUENTES_PDF.bold.nombre, FUENTE_JAKARTA_BYTES.bold)   // PDFKit acepta Uint8Array / Buffer
 */
import { FUENTES_INCRUSTADAS } from './incrustadas.ts';

export type ClaveFuente = 'regular' | 'bold' | 'extrabold';
export const FUENTE_JAKARTA_FORMATO = 'ttf' as const;
export const FUENTES_PDF: Record<ClaveFuente, { nombre: string; peso: number }> = {
  regular: { nombre: FUENTES_INCRUSTADAS.regular.familia, peso: FUENTES_INCRUSTADAS.regular.peso },
  bold: { nombre: FUENTES_INCRUSTADAS.bold.familia, peso: FUENTES_INCRUSTADAS.bold.peso },
  extrabold: { nombre: FUENTES_INCRUSTADAS.extrabold.familia, peso: FUENTES_INCRUSTADAS.extrabold.peso },
};

const cache: Partial<Record<ClaveFuente, Uint8Array>> = {};
function bytesDe(clave: ClaveFuente): Uint8Array {
  const hecho = cache[clave];
  if (hecho) return hecho;
  const bin = atob(FUENTES_INCRUSTADAS[clave].base64), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  cache[clave] = out;
  return out;
}

export const FUENTE_JAKARTA_BYTES = {
  get regular(): Uint8Array { return bytesDe('regular'); },
  get bold(): Uint8Array { return bytesDe('bold'); },
  get extrabold(): Uint8Array { return bytesDe('extrabold'); },
};