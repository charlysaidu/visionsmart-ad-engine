// Logo original incrustado y pie con la marca vigente (visionsmart.app / @visionsmart.app).
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { IDS_PLANTILLAS, FORMATOS, renderSvg } from '../src/index.ts';
import { LOGO_SIMBOLO_BASE64, LOGO_SIMBOLO_SHA256, LOGO_SIMBOLO_HREF } from '../src/logo.ts';
import { layoutDe } from '../src/layouts.ts';
import { PLANTILLAS } from '../src/plantillas.ts';

// SHA-256 del logo-simbolo.png que usan App Cliente / App Finanzas (assets/logo-simbolo.png)
const SHA_ORIGINAL = '8e1639f58f927ce7a337c4db947713fc317bb8de13e00d90a7ef2303679b56ce';
const ctx = { producto: { nombre: 'Cargador Rapido 25W', precioUsd: 12, fotoHref: null, garantia: '3 meses', marcas: ['Samsung'] }, tasaBs: 600 } as any;

test('el logo incrustado es el archivo original (mismo SHA-256), no una reconstruccion', () => {
  const bytes = Buffer.from(LOGO_SIMBOLO_BASE64, 'base64');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), SHA_ORIGINAL);
  assert.equal(LOGO_SIMBOLO_SHA256, SHA_ORIGINAL);
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  assert.ok(LOGO_SIMBOLO_HREF.startsWith('data:image/png;base64,iVBOR'));
});

for (const id of IDS_PLANTILLAS) {
  for (const f of ['4x5', '1x1', '9x16'] as const) {
    test(`${id} ${f}: logo original en el mismo tamano y lugar, wordmark intacto y pie nuevo`, () => {
      const svg = renderSvg(id, ctx, f);
      const lay = layoutDe(PLANTILLAS[id], f).logo;
      const imgs = [...svg.matchAll(/<image href="data:image\/png;base64,[^"]+" x="([\d.-]+)" y="([\d.-]+)" width="([\d.-]+)" height="([\d.-]+)"/g)];
      // sin foto: ademas del logo del encabezado hay el simbolo tenue de la marca en el lugar de la foto
      const cab = imgs.find((m) => Math.abs(Number(m[2]) - lay.y) < 0.6 && Number(m[3]) === lay.h);
      assert.ok(cab, 'logo del encabezado con el alto del layout');
      assert.equal(Number(cab![3]), Number(cab![4]));
      assert.ok(svg.includes('>VISIONSMART</text>'));
      assert.ok(!svg.includes('stroke-width') || !/<circle[^>]*stroke="url\(#lg/.test(svg), 'sin el aro vectorial inventado');
      assert.ok(svg.includes('visionsmart.app') && svg.includes('@visionsmart.app'));
      assert.ok(!svg.includes('visionsmart.ve'));
      assert.ok(FORMATOS[f]);
    });
  }
}