// Genera test/golden/1.0.0-base.json: sha256 del SVG de cada combinacion con el motor SIN tema (huellas de regresion del motor 1.0.0). Solo se regenera a proposito, cuando cambia el diseno.
import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { IDS_PLANTILLAS, renderSvg, VERSION_MOTOR } from '../src/index.ts';
const prod = { nombre: 'Cargador Samsung 25W USB tipo C/C carga rápida', precioUsd: 12.85, fotoHref: 'data:image/png;base64,iVBORw0KGgo=', garantia: '3 meses', conector: 'usb_c', tipoAccesorio: 'cargador', categoria: 'Cargadores', marcas: ['samsung'], descripcion: 'Cargador Samsung de 25W' } as any;
const casos: Record<string, any> = {
  usd: { precio: 'usd' }, bs: { precio: 'bs' }, ninguno: { precio: 'ninguno' },
  promo: { precio: 'usd', promo: { activa: true, precioPromoUsd: 12.85, precioAnteriorUsd: 15, unidades: 8, vigenciaISO: '2026-12-31' } },
  promoBs: { precio: 'bs', promo: { activa: true, precioPromoUsd: 10, vigenciaISO: '2026-12-31' } },
};
// Se AMPLIA, nunca se reescribe: las huellas ya capturadas (las del 1.0.0) no se tocan, solo se agregan las que faltan (plantillas nuevas).
const RUTA = 'test/golden/1.0.0-base.json';
const previo = existsSync(RUTA) ? JSON.parse(readFileSync(RUTA, 'utf8')) : { version: VERSION_MOTOR, casos: {} };
const out: Record<string, string> = previo.casos;
for (const id of IDS_PLANTILLAS) for (const f of ['4x5', '1x1', '9x16'] as const) for (const [k, c] of Object.entries(casos)) {
  { const clave = `${id}|${f}|${k}`; if (!(clave in out)) out[clave] = createHash('sha256').update(renderSvg(id, { producto: prod, tasaBs: 163.33, ...c }, f)).digest('hex'); }
}
writeFileSync(RUTA, JSON.stringify({ version: previo.version, ampliado: VERSION_MOTOR, casos: out }, null, 1));
console.log(VERSION_MOTOR, Object.keys(out).length, 'huellas');
