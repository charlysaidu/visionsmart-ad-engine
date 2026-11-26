import type { IconoId } from './iconos.ts';
import { partirTexto } from './util.ts';

export type DatosProducto = {
  nombre: string;
  precioUsd: number | null;
  fotoHref?: string | null;
  descripcion?: string | null;
  /** Texto de garantia tal como esta en el inventario: "Sin garantía", "15 días", "1 mes", "3 meses", "6 meses", "1 año". */
  garantia?: string | null;
  categoria?: string | null;
  tipoAccesorio?: string | null;
  conector?: string | null;
  marcas?: string[] | string | null;
};

const sinTildes = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export type Caracteristica = { icono: IconoId; lineas: string[] };

const CONECTORES: Record<string, string> = { lightning: 'Lightning', usb_c: 'USB-C', micro_usb: 'Micro USB' };

function categoriaDe(p: DatosProducto): string {
  const tipo = (p.tipoAccesorio ?? '').toLowerCase();
  if (tipo === 'vidrio') return 'vidrio';
  if (tipo === 'forro') return 'forro';
  const t = sinTildes(`${p.categoria ?? ''} ${p.nombre}`).toLowerCase();
  if (/vidrio/.test(t)) return 'vidrio';
  if (/forro|funda|case|estuche/.test(t)) return 'forro';
  if (/powerbank|power bank/.test(t)) return 'powerbank';
  if (/audifono|airpod|earbud|headset|auricular|buds/.test(t)) return 'audifono';
  if (/cargador|charger/.test(t)) return 'cargador';
  if (/cable/.test(t)) return 'cable';
  if (/corneta|speaker|bocina|parlante/.test(t)) return 'corneta';
  return 'accesorio';
}

function primeraFrase(desc: string | null | undefined): string {
  const d = (desc ?? '').replace(/\s+/g, ' ').trim();
  if (!d) return '';
  return d.split(/\s*[.!?;]\s|\n/)[0].replace(/[\s.!?,;:]+$/, '').trim();
}

/**
 * Hasta `max` caracteristicas con datos REALES del producto (descripcion, conector, potencia, marcas, tipo); se completan con
 * genericos que no prometen nada que el producto no tenga. Cada una: icono + 1-2 lineas cortas.
 */
export function caracteristicasDe(p: DatosProducto, max = 3, soloReales = false): Caracteristica[] {
  const out: Caracteristica[] = [];
  const texto = sinTildes(`${p.nombre} ${p.descripcion ?? ''}`).toLowerCase();
  const cat = categoriaDe(p);
  const frase = primeraFrase(p.descripcion);
  if (frase.length >= 8 && frase.length <= 48) out.push({ icono: 'check', lineas: [frase.charAt(0).toLocaleUpperCase('es') + frase.slice(1)] });
  if (/bluetooth|inalambric|wireless/.test(texto)) out.push({ icono: 'bluetooth', lineas: ['Conexión', /bluetooth/.test(texto) ? 'Bluetooth' : 'inalámbrica'] });
  if (p.conector && CONECTORES[p.conector]) out.push({ icono: 'cable', lineas: ['Conector', CONECTORES[p.conector]] });
  const w = /(\d{2,3})\s?w\b/i.exec(p.nombre);
  if (w) out.push({ icono: 'rayo', lineas: ['Carga rápida', `${w[1]} W`] });
  const marcas = (Array.isArray(p.marcas) ? p.marcas : typeof p.marcas === 'string' ? [p.marcas] : []).filter((m) => m && m.toLowerCase() !== 'todas');
  if (marcas.length) out.push({ icono: 'telefono', lineas: ['Compatible', marcas[0].toLocaleUpperCase('es')] });
  else if (/iphone/.test(texto)) out.push({ icono: 'telefono', lineas: ['Compatible', 'iPhone'] });
  if (!soloReales) {
  if (cat === 'audifono') out.push({ icono: 'audio', lineas: ['Sonido', 'envolvente'] });
  if (cat === 'vidrio') out.push({ icono: 'diamante', lineas: ['Alta', 'dureza'] });
  if (cat === 'forro') out.push({ icono: 'escudo', lineas: ['Protección', 'total'] });
  if (cat === 'cable') out.push({ icono: 'carga', lineas: ['Carga y', 'datos'] });
  if (cat === 'powerbank') out.push({ icono: 'bateria', lineas: ['Energía donde', 'la necesites'] });
  if (cat === 'cargador') out.push({ icono: 'rayo', lineas: ['Carga rápida', 'y segura'] });
  }
  for (const g of [
    { icono: 'estrella', lineas: ['Alta', 'calidad'] },
    { icono: 'chip', lineas: ['Diseño', 'elegante'] },
    { icono: 'check', lineas: ['Fácil', 'de usar'] },
  ] as Caracteristica[]) { if (out.length >= max) break; out.push(g); }
  return out.slice(0, max);
}

export type Garantia = { tiene: boolean; linea1: string; linea2: string };

/** Mismo criterio que la imagen de compartir de App Cliente: "6 MESES" / "1 AÑO" / sin garantia. */
export function garantiaDe(texto: string | null | undefined): Garantia {
  const g = (texto ?? '').trim();
  if (!g || /sin garant/i.test(g)) return { tiene: false, linea1: 'SIN', linea2: 'GARANTÍA' };
  const m = /(\d+)\s*(mes|meses|año|años|ano|anos|dia|dias|día|días)/i.exec(g);
  if (m) {
    const num = m[1], u = sinTildes(m[2]).toLowerCase();
    const unidad = u.startsWith('mes') ? (num === '1' ? 'MES' : 'MESES') : u.startsWith('an') ? (num === '1' ? 'AÑO' : 'AÑOS') : num === '1' ? 'DÍA' : 'DÍAS';
    return { tiene: true, linea1: 'GARANTÍA', linea2: `${num} ${unidad}` };
  }
  return { tiene: true, linea1: 'GARANTÍA', linea2: g.toLocaleUpperCase('es').slice(0, 12) };
}

export { partirTexto };