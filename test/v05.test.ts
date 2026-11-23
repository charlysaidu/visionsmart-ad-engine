// v0.5.0: etiqueta PRECIO en todas las plantillas y LUXURY MINIMAL solo con la paleta oficial (blanco, negro, azul, morado).
import test from 'node:test';
import assert from 'node:assert/strict';
import { IDS_PLANTILLAS, renderSvg, VERSION_MOTOR } from '../src/index.ts';

const prod = { nombre: 'Cargador Rapido 25W', precioUsd: 15, fotoHref: null, garantia: '3 meses', marcas: ['Samsung'] } as any;

test('version del motor >= 0.5.0', () => assert.match(VERSION_MOTOR, /^0\.(5|6)\.\d+/));

for (const id of IDS_PLANTILLAS) for (const f of ['4x5', '1x1', '9x16'] as const) {
  test(`${id} ${f}: PRECIO en Bs y USD, nada en Ninguno, nunca DESDE`, () => {
    const bs = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'bs' }, f);
    const usd = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'usd' }, f);
    const no = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'ninguno' }, f);
    assert.ok(bs.includes('>PRECIO<') && bs.includes('Bs. '));
    assert.ok(usd.includes('>PRECIO<') && usd.includes('$15'));
    assert.ok(!no.includes('PRECIO') && !no.includes('Bs.') && !no.includes('$15'));
    for (const s of [bs, usd, no]) assert.ok(!s.includes('DESDE'));
  });
}

function hsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, dlt = mx - mn;
  if (dlt === 0) return { h: 0, s: 0, l };
  const s = dlt / (1 - Math.abs(2 * l - 1));
  let h = mx === r ? ((g - b) / dlt) % 6 : mx === g ? (b - r) / dlt + 2 : (r - g) / dlt + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

for (const f of ['4x5', '1x1', '9x16'] as const) {
  test(`luxury-minimal ${f}: solo blanco, negro, azul y morado (sin dorados ni calidos)`, () => {
    const svg = renderSvg('luxury-minimal', { producto: prod, tasaBs: 163.33, precio: 'usd', promo: { activa: true, precioPromoUsd: 12, precioAnteriorUsd: 15, unidades: 5, vigenciaISO: '2026-12-31' } }, f)
      .replace(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/g, '');                       // sin los bytes del logo
    const colores = [...new Set([...svg.matchAll(/#[0-9A-Fa-f]{6}\b/g)].map((m) => m[0].toUpperCase()))];
    assert.ok(colores.length > 5);
    for (const c of colores) {
      const { h, s } = hsl(c);
      const calido = s > 0.12 && (h < 75 || h > 335) && !(s < 0.2);
      assert.ok(!calido, `color calido/dorado en luxury-minimal: ${c}`);
    }
    assert.ok(svg.includes('#1367A4') && svg.includes('#9D40CB') && svg.includes('#FFFFFF') && svg.includes('#0A0A0F'));
    assert.ok(!/#(9C7B43|C8A96D|8C6D3B|B89B66|A88650|B8935A|DCD7CF|F3F0EA)/i.test(svg));
  });
}