import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { renderSvgConFuentes } from '../src/con-fuentes.ts';
import { zipEnMemoria } from '../src/index.ts';
const URL_FOTO = 'https://txowpnnhsonptmgkimlo.supabase.co/storage/v1/object/public/productos/producto_1792446598481_6ji0q.webp';
const buf = Buffer.from(await (await fetch(URL_FOTO)).arrayBuffer());
const fotoHref = `data:image/webp;base64,${buf.toString('base64')}`;
mkdirSync('muestras', { recursive: true });
const producto = { nombre: 'Cargador Samsung 45W USB-C', precioUsd: 24.9, fotoHref, garantia: '6 meses', descripcion: 'Carga super rápida con cable incluido', conector: 'usb_c', marcas: ['Samsung'] };
const promo = { activa: true, precioPromoUsd: 19.9, unidades: 12, vigenciaISO: '2026-11-30' };
for (const [id, f] of [['black-premium', '4x5'], ['pure-white', '4x5'], ['product-spotlight', '4x5'], ['tech-editorial', '1x1'], ['luxury-minimal', '9x16'], ['gradient-experience', '4x5']] as const) {
  writeFileSync(`muestras/promo-${id}-${f}.svg`, renderSvgConFuentes(id, { producto, tasaBs: 203.456, promo }, f));
}
// zip real para validarlo con Expand-Archive de Windows
writeFileSync('muestras/prueba.zip', await zipEnMemoria([
  { nombre: 'Cargador Samsung.png', leer: () => new Uint8Array(readFileSync('muestras/pc-4x5.png')) },
  { nombre: 'Cargador Samsung.png', leer: () => new Uint8Array(readFileSync('muestras/pc-1x1.png')) },
  { nombre: 'ñandú ✓.txt', leer: () => new TextEncoder().encode('hola') },
]));
console.log('ok');