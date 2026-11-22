// Genera src/logo.ts incrustando el logo ORIGINAL de la marca (el mismo archivo que usan App Cliente, App Finanzas y Sistema PC).
//   node scripts/generar-logo.mjs <ruta a logo-simbolo.png>
// Archivo de referencia: logo-simbolo.png, 256x256, SHA-256 8e1639f58f927ce7... (assets/ de visionsmart-cliente y visionsmart-mobile).
import fs from 'node:fs';
import crypto from 'node:crypto';

const ruta = process.argv[2];
if (!ruta) { console.error('Uso: node scripts/generar-logo.mjs <logo-simbolo.png>'); process.exit(1); }
const bytes = fs.readFileSync(ruta);
const sha = crypto.createHash('sha256').update(bytes).digest('hex');
const ancho = bytes.readUInt32BE(16), alto = bytes.readUInt32BE(20);
if (bytes.subarray(1, 4).toString() !== 'PNG') { console.error('No es un PNG'); process.exit(1); }
const salida = `/**
 * Logo ORIGINAL de VisionSmart (simbolo: aro + punto + tallo), incrustado tal cual como PNG (data URI base64).
 * Es el mismo archivo logo-simbolo.png de las apps (App Cliente / App Finanzas / Sistema PC): NO es una reconstruccion vectorial.
 * Generado por scripts/generar-logo.mjs; no editar a mano.
 */
export const LOGO_SIMBOLO_SHA256 = '${sha}';
export const LOGO_SIMBOLO_ANCHO = ${ancho};
export const LOGO_SIMBOLO_ALTO = ${alto};
export const LOGO_SIMBOLO_BASE64 = '${bytes.toString('base64')}';
export const LOGO_SIMBOLO_HREF = 'data:image/png;base64,' + LOGO_SIMBOLO_BASE64;
`;
fs.writeFileSync(new URL('../src/logo.ts', import.meta.url), salida);
console.log(`src/logo.ts · ${ancho}x${alto} · ${bytes.length} bytes · sha256 ${sha}`);