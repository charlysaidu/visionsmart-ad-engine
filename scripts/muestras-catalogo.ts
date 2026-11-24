// Hoja de contacto del CATALOGO PDF: portadas, y paginas armadas (cabecera + zona de imagen 4:5 + pie), sin y con tema Navidad. Para revisarla a ojo en un navegador.
//   node scripts/muestras-catalogo.ts <salida.html> [carta|a4] [1|2] [url de una foto 4:5 (opcional)]
import { writeFileSync } from 'node:fs';
import { paginaDe, type TamanoPagina, type PorPagina } from '../src/index.ts';
import { renderPortadaConFuentes, renderCabeceraConFuentes, renderPieConFuentes } from '../src/con-fuentes.ts';
const [out, tam = 'carta', por = '1', foto = ''] = process.argv.slice(2);
const T = tam as TamanoPagina, P = Number(por) as PorPagina, g = paginaDe(T, P), esc = 0.5;
const nav = { id: 'navidad' as const, intensidad: 'equilibrada' as const, semilla: 'a', productoId: 'cat' };
const datoUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
let fotoHref = '';
if (foto) { const b = Buffer.from(await (await fetch(foto)).arrayBuffer()); fotoHref = `data:${foto.endsWith('.png') ? 'image/png' : 'image/webp'};base64,${b.toString('base64')}`; }
const caja = (x: number, y: number, w: number, h: number, html: string, extra = '') => `<div style="position:absolute;left:${x * esc}px;top:${y * esc}px;width:${w * esc}px;height:${h * esc}px;${extra}">${html}</div>`;
const img = (svg: string) => `<img style="width:100%;height:100%;display:block" src="${datoUri(svg)}">`;
const marco = (w: number, h: number, interior: string) => `<div style="display:inline-block;margin:8px;vertical-align:top"><div style="position:relative;width:${w * esc}px;height:${h * esc}px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.5);overflow:hidden">${interior}</div></div>`;
const pagina = (cat: string, primera: boolean, n: number, tema: any) => marco(g.ancho, g.alto,
  caja(0, 0, g.ancho, g.cabecera.h, img(renderCabeceraConFuentes({ categoria: cat, primera, tema }, T, P))) +
  g.imagenes.map((r) => caja(r.x, r.y, r.w, r.h, fotoHref ? `<img style="width:100%;height:100%;object-fit:contain;background:#eee" src="${fotoHref}">` : `<div style="width:100%;height:100%;background:#E2E8F0;display:flex;align-items:center;justify-content:center;font:12px sans-serif;color:#64748B">imagen 4:5 · ${r.w}×${r.h} pt</div>`)).join('') +
  caja(0, g.pie.y, g.ancho, g.pie.h, img(renderPieConFuentes({ pagina: n, fechaPrecios: '24/11/2026', tema }, T, P))));
const portada = (d: any) => marco(g.ancho, g.alto, caja(0, 0, g.ancho, g.alto, img(renderPortadaConFuentes(d, T, P))));
const html = [
  portada({ tipo: 'categoria', titulo: 'Cargadores y cables', fecha: '24 de noviembre de 2026' }), portada({ tipo: 'inventario', fecha: 'Noviembre 2026' }),
  portada({ tipo: 'categoria', titulo: 'Accesorios para celulares y tabletas', fecha: '24 de noviembre de 2026', tema: nav }), portada({ tipo: 'inventario', fecha: 'Noviembre 2026', tema: nav }),
  '<br>', pagina('Cargadores', true, 1, null), pagina('Cargadores', false, 2, null), pagina('Cargadores', true, 1, nav), pagina('Cargadores', false, 2, nav),
].join('');
writeFileSync(out, `<html><head><meta charset="utf-8"></head><body style="margin:0;background:#777;padding:6px;width:${(g.ancho * esc + 16) * 4 + 20}px">${html}</body></html>`);