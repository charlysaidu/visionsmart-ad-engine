// Genera test/golden/0.6.0.json: sha256 del SVG de cada combinacion con el motor SIN tema (referencia para la regresion cero de v0.7.0).
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { IDS_PLANTILLAS, renderSvg, VERSION_MOTOR } from '../src/index.ts';
const prod = { nombre: 'Cargador Samsung 25W USB tipo C/C carga rápida', precioUsd: 12.85, fotoHref: 'data:image/png;base64,iVBORw0KGgo=', garantia: '3 meses', conector: 'usb_c', tipoAccesorio: 'cargador', categoria: 'Cargadores', marcas: ['samsung'], descripcion: 'Cargador Samsung de 25W' } as any;
const casos: Record<string, any> = {
  usd: { precio: 'usd' }, bs: { precio: 'bs' }, ninguno: { precio: 'ninguno' },
  promo: { precio: 'usd', promo: { activa: true, precioPromoUsd: 12.85, precioAnteriorUsd: 15, unidades: 8, vigenciaISO: '2026-12-31' } },
  promoBs: { precio: 'bs', promo: { activa: true, precioPromoUsd: 10, vigenciaISO: '2026-12-31' } },
};
const out: Record<string, string> = {};
for (const id of IDS_PLANTILLAS) for (const f of ['4x5', '1x1', '9x16'] as const) for (const [k, c] of Object.entries(casos)) {
  out[`${id}|${f}|${k}`] = createHash('sha256').update(renderSvg(id, { producto: prod, tasaBs: 163.33, ...c }, f)).digest('hex');
}
writeFileSync('test/golden/0.6.0.json', JSON.stringify({ version: VERSION_MOTOR, casos: out }, null, 1));
console.log(VERSION_MOTOR, Object.keys(out).length, 'huellas');
