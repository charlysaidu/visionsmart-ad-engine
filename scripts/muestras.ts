// Genera las 10 plantillas x 3 formatos en ./muestras (SVG con fuentes incrustadas) para revisarlas en un navegador/Electron.
import { writeFileSync, mkdirSync } from 'node:fs';
import { renderSvgConFuentes } from '../src/con-fuentes.ts';
import { IDS_PLANTILLAS, FORMATOS } from '../src/index.ts';

const URL_FOTO = process.argv[2] ?? 'https://txowpnnhsonptmgkimlo.supabase.co/storage/v1/object/public/productos/producto_1792446598481_6ji0q.webp';
const buf = Buffer.from(await (await fetch(URL_FOTO)).arrayBuffer());
const fotoHref = `data:${URL_FOTO.endsWith('.png') ? 'image/png' : 'image/webp'};base64,${buf.toString('base64')}`;
mkdirSync('muestras', { recursive: true });
const producto = {
  nombre: process.argv[3] ?? 'Cargador Samsung 45W USB-C', precioUsd: 24.9, fotoHref, garantia: '6 meses',
  descripcion: 'Carga super rápida con cable incluido', conector: 'usb_c', marcas: ['Samsung'],
};
for (const id of IDS_PLANTILLAS) for (const f of Object.keys(FORMATOS)) {
  const svg = renderSvgConFuentes(id, { producto, tasaBs: 203.456, precio: 'bs' }, f as any);
  writeFileSync(`muestras/${id}-${f}.svg`, svg);
}
console.log('listo:', IDS_PLANTILLAS.length * 3, 'SVG');