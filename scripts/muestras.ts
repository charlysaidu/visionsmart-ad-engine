// Genera SVG de muestra en ./muestras con una foto real del inventario (para revisarlos en un navegador o en Electron).
import { writeFileSync, mkdirSync } from 'node:fs';
import { renderSvg, FORMATOS } from '../src/index.ts';

const URL_FOTO = process.argv[2] ?? 'https://txowpnnhsonptmgkimlo.supabase.co/storage/v1/object/public/productos/producto_1792446598481_6ji0q.webp';
const resp = await fetch(URL_FOTO);
const buf = Buffer.from(await resp.arrayBuffer());
const mime = URL_FOTO.endsWith('.png') ? 'image/png' : 'image/webp';
const fotoHref = `data:${mime};base64,${buf.toString('base64')}`;
mkdirSync('muestras', { recursive: true });
for (const f of Object.keys(FORMATOS)) {
  const svg = renderSvg('black-premium', { producto: { nombre: 'Audifonos Gamer RGB Pro', precioUsd: 24.9, fotoHref }, tasaBs: 203.456 }, f as any);
  writeFileSync(`muestras/black-premium-${f}.svg`, svg);
  console.log(f, (svg.length / 1024).toFixed(0) + ' KB de SVG');
}