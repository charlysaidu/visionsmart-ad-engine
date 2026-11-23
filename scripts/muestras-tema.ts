// Hoja de contacto del tema: las 10 plantillas con tema Navidad (para revisarlas a ojo en un navegador).
//   node scripts/muestras-tema.ts <salida.html> [formato 4x5] [intensidad equilibrada] [semilla a] [promo 0|1] [url foto]
import { writeFileSync } from 'node:fs';
import { renderSvgConFuentes } from '../src/con-fuentes.ts';
import { IDS_PLANTILLAS, FORMATOS } from '../src/index.ts';
const [out, fmt = '4x5', inten = 'equilibrada', semilla = 'a', promo = '0', url = 'https://txowpnnhsonptmgkimlo.supabase.co/storage/v1/object/public/productos/producto_1795026929549_tan8y.webp'] = process.argv.slice(2);
const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
const fotoHref = `data:${url.endsWith('.png') ? 'image/png' : 'image/webp'};base64,${buf.toString('base64')}`;
const producto = { nombre: 'Cargador Samsung 25W USB tipo C/C carga rápida', precioUsd: 12.85, fotoHref, garantia: '3 meses', conector: 'usb_c', tipoAccesorio: 'cargador', categoria: 'Cargadores', marcas: ['samsung'], descripcion: 'Cargador Samsung de 25W con cable USB-C a USB-C' } as any;
const { ancho, alto } = FORMATOS[fmt as '4x5'], esc = 0.36;
const celdas = IDS_PLANTILLAS.map((id) => {
  const svg = renderSvgConFuentes(id, { producto, tasaBs: 163.33, precio: 'usd', ...(promo === '1' ? { promo: { activa: true, precioPromoUsd: 12.85, precioAnteriorUsd: 15, unidades: 8, vigenciaISO: '2026-12-31' } } : {}), tema: { id: 'navidad', intensidad: inten as any, semilla, productoId: 349 } } as any, fmt as any);
  return `<div style="display:inline-block;margin:3px;width:${Math.round(ancho * esc)}px;height:${Math.round(alto * esc)}px"><img style="width:100%;height:100%" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></div>`;
});
writeFileSync(out, `<html><head><meta charset="utf-8"></head><body style="margin:0;background:#777;width:${Math.round((ancho * esc + 6) * 5)}px">${celdas.join('')}</body></html>`);