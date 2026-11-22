/**
 * ZIP sin compresion ("store") generado por partes: solo se tiene en memoria UN archivo a la vez (un lote de 100 PNG no cabria
 * entero en el teléfono). Formato ZIP clásico (sin ZIP64): máx. 65535 archivos y 4 GB; nombres UTF-8.
 */
const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();

export function crc32(datos: Uint8Array, previo = 0): number {
  let c = ~previo >>> 0;
  for (let i = 0; i < datos.length; i++) c = TABLA_CRC[(c ^ datos[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

export type EntradaZip = { nombre: string; leer: () => Promise<Uint8Array> | Uint8Array };

function utf8(s: string): Uint8Array {
  const out: number[] = [];
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return Uint8Array.from(out);
}

/** Nombre seguro dentro del zip: sin rutas ni caracteres invalidos. */
export function nombreSeguro(nombre: string): string {
  const n = nombre.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim();
  return n || 'archivo';
}

function fechaDos(d: Date): { fecha: number; hora: number } {
  const y = Math.max(1980, d.getFullYear());
  return { fecha: ((y - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(), hora: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1) };
}

/** Genera el zip como trozos (cabeceras + datos + directorio central). Los nombres repetidos se renombran "x (2).png". */
export async function* zipPorPartes(entradas: EntradaZip[], ahora: Date = new Date()): AsyncGenerator<Uint8Array> {
  if (entradas.length > 65535) throw new Error('Demasiados archivos para un ZIP');
  const { fecha, hora } = fechaDos(ahora);
  const usados = new Set<string>();
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const e of entradas) {
    let nombre = nombreSeguro(e.nombre);
    if (usados.has(nombre.toLowerCase())) {
      const punto = nombre.lastIndexOf('.');
      const base = punto > 0 ? nombre.slice(0, punto) : nombre, ext = punto > 0 ? nombre.slice(punto) : '';
      let k = 2;
      while (usados.has(`${base} (${k})${ext}`.toLowerCase())) k++;
      nombre = `${base} (${k})${ext}`;
    }
    usados.add(nombre.toLowerCase());
    const datos = await e.leer();
    const nom = utf8(nombre);
    const crc = crc32(datos);
    const loc = new Uint8Array(30 + nom.length);
    const dv = new DataView(loc.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true); dv.setUint16(8, 0, true);
    dv.setUint16(10, hora, true); dv.setUint16(12, fecha, true); dv.setUint32(14, crc, true);
    dv.setUint32(18, datos.length, true); dv.setUint32(22, datos.length, true); dv.setUint16(26, nom.length, true); dv.setUint16(28, 0, true);
    loc.set(nom, 30);
    const cen = new Uint8Array(46 + nom.length);
    const dc = new DataView(cen.buffer);
    dc.setUint32(0, 0x02014b50, true); dc.setUint16(4, 20, true); dc.setUint16(6, 20, true); dc.setUint16(8, 0x0800, true); dc.setUint16(10, 0, true);
    dc.setUint16(12, hora, true); dc.setUint16(14, fecha, true); dc.setUint32(16, crc, true);
    dc.setUint32(20, datos.length, true); dc.setUint32(24, datos.length, true); dc.setUint16(28, nom.length, true);
    dc.setUint32(42, offset, true);
    cen.set(nom, 46);
    central.push(cen);
    yield loc;
    yield datos;
    offset += loc.length + datos.length;
  }
  let tam = 0;
  for (const c of central) { yield c; tam += c.length; }
  const fin = new Uint8Array(22);
  const df = new DataView(fin.buffer);
  df.setUint32(0, 0x06054b50, true); df.setUint16(8, central.length, true); df.setUint16(10, central.length, true);
  df.setUint32(12, tam, true); df.setUint32(16, offset, true);
  yield fin;
}

/** Version en memoria (para pruebas y lotes chicos). */
export async function zipEnMemoria(entradas: EntradaZip[], ahora?: Date): Promise<Uint8Array> {
  const partes: Uint8Array[] = [];
  let total = 0;
  for await (const p of zipPorPartes(entradas, ahora)) { partes.push(p); total += p.length; }
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of partes) { out.set(p, o); o += p.length; }
  return out;
}