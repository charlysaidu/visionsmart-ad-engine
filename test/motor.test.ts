import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSvg, FORMATOS, textoBolivares, textoDolares, redondearBs, miles, tituloEnLineas, esc } from '../src/index.ts';

const ctx = { producto: { nombre: 'Audifonos Gamer RGB Pro', precioUsd: 24.9, fotoHref: 'data:image/png;base64,AAAA' }, tasaBs: 203.456 };

test('dimensiones por formato en width/height/viewBox', () => {
  for (const [f, d] of Object.entries(FORMATOS)) {
    const svg = renderSvg('black-premium', ctx, f as any);
    assert.match(svg, new RegExp(`width="${d.ancho}" height="${d.alto}" viewBox="0 0 ${d.ancho} ${d.alto}"`));
    assert.ok(svg.startsWith('<svg ') && svg.endsWith('</svg>'));
  }
});

test('precio: Bs redondeado a 100 con punto de miles; USD con 2 decimales (mismas reglas que App Cliente)', () => {
  assert.equal(redondearBs(2034.56), 2000);
  assert.equal(redondearBs(2050), 2100);
  assert.equal(miles(20300), '20.300'); assert.equal(miles(1234567), '1.234.567'); assert.equal(miles(950), '950');
  assert.equal(textoBolivares(24.9, 203.456), 'Bs. 5.100');
  assert.equal(textoBolivares(100, 203.456), 'Bs. 20.300');
  assert.equal(textoDolares(24.9), '$24.90'); assert.equal(textoDolares(5), '$5.00');
  for (const t of [null, 0, -1, NaN]) assert.equal(textoBolivares(10, t as any), null);
  assert.equal(textoBolivares(null, 200), null); assert.equal(textoDolares(0), null);
});

test('la plantilla muestra Bs grande y USD pequeño debajo; sin tasa solo queda el USD', () => {
  const svg = renderSvg('black-premium', ctx, '4x5');
  const iBs = svg.indexOf('Bs. 5.100'), iUsd = svg.indexOf('$24.90');
  assert.ok(iBs > 0 && iUsd > iBs);
  const tamBs = Number(/font-size="(\d+)" fill="url\(#precio\)"/.exec(svg)![1]);
  const tamUsd = Number(/font-size="(\d+)" fill="#9AA6BF"/.exec(svg)![1]);
  assert.ok(tamBs > tamUsd * 2);
  const sin = renderSvg('black-premium', { ...ctx, tasaBs: null }, '4x5');
  assert.ok(!sin.includes('Bs.') && sin.includes('$24.90'));
});

test('pie: logo Vision Smart + visionsmart.ve + @visionsmart.ve y nada mas', () => {
  const svg = renderSvg('black-premium', ctx, '1x1');
  assert.ok(svg.includes('VISION SMART') && svg.includes('visionsmart.ve') && svg.includes('@visionsmart.ve'));
  assert.ok(!/whatsapp|delivery|env[ií]os/i.test(svg));
  assert.ok(renderSvg('black-premium', { ...ctx, marca: { logoHref: 'data:image/png;base64,BBBB' } }, '1x1').includes('data:image/png;base64,BBBB'));
});

test('escapa texto y atributos; sin foto no hay <image> de producto', () => {
  const svg = renderSvg('black-premium', { ...ctx, producto: { nombre: 'Cable <USB> & "C"', precioUsd: 5 } }, '4x5');
  assert.ok(svg.includes('CABLE &lt;USB&gt; &amp; &quot;C&quot;'));
  assert.ok(!svg.includes('<image'));
  assert.equal(esc('a&b'), 'a&amp;b');
});

test('titulo: 1 linea si cabe, 2 si no, recorta con ... y nunca revienta', () => {
  assert.equal(tituloEnLineas('Cable USB', 920, 72, 44).lineas.length, 1);
  assert.equal(tituloEnLineas('Audifonos inalambricos bluetooth con cancelacion de ruido', 920, 72, 44).lineas.length, 2);
  const largo = tituloEnLineas('X'.repeat(300), 920, 72, 44);
  assert.ok(largo.lineas[0].endsWith('...') && largo.tam === 44);
  assert.deepEqual(tituloEnLineas('   ', 920, 72, 44).lineas, ['']);
});

test('determinista: mismo contexto -> mismo SVG; plantilla o formato inexistente lanzan error claro', () => {
  assert.equal(renderSvg('black-premium', ctx, '9x16'), renderSvg('black-premium', ctx, '9x16'));
  assert.throws(() => renderSvg('nada' as any, ctx, '4x5'), /Plantilla desconocida/);
  assert.throws(() => renderSvg('simple', ctx, '2x3' as any), /Formato desconocido/);
});

test('sin APIs de plataforma ni filtros ni emojis en la salida', () => {
  for (const p of ['simple', 'black-premium'] as const) {
    const svg = renderSvg(p, ctx, '4x5');
    assert.ok(!/<filter|feGaussianBlur|<foreignObject/.test(svg));
    assert.ok(!/\p{Extended_Pictographic}/u.test(svg));
  }
});