// Genera src/metricas.ts (anchos reales de glifo, para medir texto igual en todas las plataformas) y
// src/incrustadas.ts (las TTF en base64, para incrustarlas en el SVG donde el rasterizador soporta @font-face: PC/Chromium).
// Uso: node scripts/generar-fuentes.mjs [carpeta de @expo-google-fonts/plus-jakarta-sans]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2] ?? join('..', 'visionsmart-mobile', 'node_modules', '@expo-google-fonts', 'plus-jakarta-sans');
const FUENTES = [
  { clave: 'regular', familia: 'Jakarta-Regular', peso: 400, archivo: '400Regular/PlusJakartaSans_400Regular.ttf' },
  { clave: 'bold', familia: 'Jakarta-Bold', peso: 700, archivo: '700Bold/PlusJakartaSans_700Bold.ttf' },
  { clave: 'extrabold', familia: 'Jakarta-ExtraBold', peso: 800, archivo: '800ExtraBold/PlusJakartaSans_800ExtraBold.ttf' },
];

function parseTtf(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const n = dv.getUint16(4);
  const t = {};
  for (let i = 0; i < n; i++) {
    const o = 12 + i * 16;
    t[String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3))] = dv.getUint32(o + 8);
  }
  const upm = dv.getUint16(t.head + 18);
  const nH = dv.getUint16(t.hhea + 34);
  const adv = (gid) => dv.getUint16(t.hmtx + 4 * Math.min(gid, nH - 1));
  // cmap: subtabla formato 4 (Windows Unicode BMP)
  const nSub = dv.getUint16(t.cmap + 2);
  let sub = null;
  for (let i = 0; i < nSub; i++) {
    const o = t.cmap + 4 + i * 8;
    const plat = dv.getUint16(o), enc = dv.getUint16(o + 2), off = dv.getUint32(o + 4);
    if ((plat === 3 && enc === 1) || (plat === 0 && dv.getUint16(t.cmap + off) === 4)) sub = t.cmap + off;
  }
  if (sub == null || dv.getUint16(sub) !== 4) throw new Error('cmap formato 4 no encontrado');
  const segX2 = dv.getUint16(sub + 6);
  const fin = sub + 14, ini = fin + segX2 + 2, delta = ini + segX2, rango = delta + segX2;
  const gidDe = (cp) => {
    for (let s = 0; s < segX2 / 2; s++) {
      const e = dv.getUint16(fin + 2 * s);
      if (cp > e) continue;
      const st = dv.getUint16(ini + 2 * s);
      if (cp < st) return 0;
      const ro = dv.getUint16(rango + 2 * s);
      if (ro === 0) return (cp + dv.getInt16(delta + 2 * s)) & 0xffff;
      const g = dv.getUint16(rango + 2 * s + ro + 2 * (cp - st));
      return g === 0 ? 0 : (g + dv.getInt16(delta + 2 * s)) & 0xffff;
    }
    return 0;
  };
  return { upm, anchoDe: (cp) => { const g = gidDe(cp); return g ? adv(g) / upm : null; } };
}

const MAX = 0x24f;                                  // Latin básico + Latin-1 + Latin extendido A/B
const EXTRA = [0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2026, 0x20ac];
const salidaMetricas = {};
let b64 = '';
for (const f of FUENTES) {
  const bytes = readFileSync(join(base, f.archivo));
  const ttf = parseTtf(bytes);
  const arr = [];
  for (let cp = 32; cp <= MAX; cp++) arr.push(Math.round((ttf.anchoDe(cp) ?? -1) * 10000) / 10000);
  const extra = {};
  for (const cp of EXTRA) { const a = ttf.anchoDe(cp); if (a != null) extra[cp] = Math.round(a * 10000) / 10000; }
  salidaMetricas[f.clave] = { arr, extra };
  b64 += `  ${f.clave}: { familia: '${f.familia}', peso: ${f.peso}, base64: '${bytes.toString('base64')}' },\n`;
  console.log(f.clave, 'glifos:', arr.filter((x) => x >= 0).length, 'ancho "A":', arr['A'.charCodeAt(0) - 32]);
}
writeFileSync('src/metricas.ts',
  `// GENERADO por scripts/generar-fuentes.mjs — no editar. Anchos de avance (en em) de Plus Jakarta Sans; -1 = el glifo no existe.\n` +
  `export const METRICAS_DESDE = 32;\nexport const METRICAS: Record<'regular' | 'bold' | 'extrabold', { arr: number[]; extra: Record<number, number> }> = ${JSON.stringify(salidaMetricas)};\n`);
writeFileSync('src/incrustadas.ts',
  `// GENERADO por scripts/generar-fuentes.mjs — no editar. Plus Jakarta Sans (OFL) en base64 para incrustar en el SVG (PC/Chromium).\n` +
  `// react-native-svg NO soporta @font-face: en el celular las fuentes se registran con expo-font (mismos archivos TTF).\n` +
  `export const FUENTES_INCRUSTADAS = {\n${b64}} as const;\n\n` +
  `/** Bloque <style> con @font-face de las 3 fuentes, listo para insertar dentro de <svg>. */\n` +
  `export function cssFuentesIncrustadas(): string {\n  const reglas = Object.values(FUENTES_INCRUSTADAS).map((f) => \`@font-face{font-family:'\${f.familia}';font-weight:\${f.peso};src:url(data:font/ttf;base64,\${f.base64}) format('truetype');}\`);\n  return \`<style>\${reglas.join('')}</style>\`;\n}\n`);