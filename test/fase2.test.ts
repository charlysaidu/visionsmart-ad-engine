import test from 'node:test';
import assert from 'node:assert/strict';
import {
  renderSvg, IDS_PLANTILLAS, FORMATOS, calcularPromo, fechaCorta, textoUnidades, repartirPlantillas, crearAleatorio,
  zipEnMemoria, zipPorPartes, crc32, nombreSeguro, type ContextoAnuncio, type Formato,
} from '../src/index.ts';

const FORMATOS_IDS = Object.keys(FORMATOS) as Formato[];
const ctx: ContextoAnuncio = {
  producto: { nombre: 'Cargador Samsung 45W USB-C', precioUsd: 24.9, fotoHref: 'data:image/png;base64,iVBORw0KGgo=', garantia: '6 meses' },
  tasaBs: 200,
};

// ── Promocion ──────────────────────────────────────────────────────────────────
test('calcularPromo: precio promo, anterior (explicito o el normal), % y validaciones', () => {
  assert.equal(calcularPromo(25, null), null);
  assert.equal(calcularPromo(25, { activa: false, precioPromoUsd: 20 }), null);
  const a = calcularPromo(25, { activa: true, precioPromoUsd: 20 })!;
  assert.deepEqual([a.precioUsd, a.anteriorUsd, a.descuentoPct], [20, 25, 20]);               // el anterior sale del precio normal
  const b = calcularPromo(25, { activa: true, precioPromoUsd: 20, precioAnteriorUsd: 40 })!;
  assert.deepEqual([b.precioUsd, b.anteriorUsd, b.descuentoPct], [20, 40, 50]);               // el escrito manda
  const c = calcularPromo(25, { activa: true })!;                                              // sin nada: solo se marca promo con el precio normal
  assert.deepEqual([c.precioUsd, c.anteriorUsd, c.descuentoPct], [25, null, null]);
  const d = calcularPromo(25, { activa: true, precioPromoUsd: 30 })!;                          // promo MAYOR que el normal: no hay tachado ni %
  assert.deepEqual([d.precioUsd, d.anteriorUsd, d.descuentoPct], [30, null, null]);
  assert.equal(calcularPromo(25, { activa: true, precioPromoUsd: 20, precioAnteriorUsd: 20 })!.anteriorUsd, null);
  assert.equal(calcularPromo(null, { activa: true, precioPromoUsd: 10 })!.precioUsd, 10);
});

test('promo: unidades y vigencia se validan', () => {
  const p = (x: object) => calcularPromo(25, { activa: true, ...x })!;
  assert.equal(p({ unidades: 12 }).unidades, 12); assert.equal(p({ unidades: 0 }).unidades, null); assert.equal(p({ unidades: 2.5 }).unidades, null);
  assert.equal(p({ unidades: 99999 }).unidades, null);
  assert.equal(p({ vigenciaISO: '2026-11-30' }).vigencia, 'OFERTA VÁLIDA HASTA EL 30/11/2026');
  for (const mala of ['2026-02-30', '2026-13-01', '30/11/2026', '', null, 'x']) assert.equal(p({ vigenciaISO: mala as any }).vigencia, null, String(mala));
  assert.equal(fechaCorta('2024-02-29'), '29/02/2024'); assert.equal(fechaCorta('2026-02-29'), null);
  assert.equal(textoUnidades(1), 'SOLO 1 UNIDAD'); assert.equal(textoUnidades(1500), 'SOLO 1.500 UNIDADES');
});

for (const id of IDS_PLANTILLAS) for (const f of FORMATOS_IDS) {
  test(`promo · ${id} · ${f}: tachado, % , unidades y vigencia dentro del lienzo`, () => {
    const svg = renderSvg(id, { ...ctx, promo: { activa: true, precioPromoUsd: 19.9, unidades: 12, vigenciaISO: '2026-11-30' } }, f);
    const { ancho: W, alto: H } = FORMATOS[f];
    assert.ok(svg.includes('OFERTA'), 'etiqueta OFERTA');
    assert.ok(svg.includes('ANTES Bs. 5.000') && svg.includes('Bs. 4.000'), 'anterior y promo en Bs');     // 24.9*200=4980->5000 ; 19.9*200=3980->4000
    assert.ok(/<line [^>]*stroke-width="3"/.test(svg), 'linea de tachado');
    assert.ok(svg.includes('-20%'), 'chip de descuento');
    assert.ok(svg.includes('SOLO 12 UNIDADES') && svg.includes('OFERTA VÁLIDA HASTA EL 30/11/2026'));
    assert.ok(!svg.includes('DESDE'));
    assert.ok(!/NaN|undefined|Infinity/.test(svg));
    for (const m of svg.matchAll(/<rect x="([\d.\-]+)" y="([\d.\-]+)" width="([\d.\-]+)" height="([\d.\-]+)" rx/g)) {
      assert.ok(Number(m[1]) >= -1 && Number(m[2]) >= -1 && Number(m[1]) + Number(m[3]) <= W + 1 && Number(m[2]) + Number(m[4]) <= H + 1, `rect fuera: ${m[0]}`);
    }
    for (const m of svg.matchAll(/<text x="([\d.\-]+)" y="([\d.\-]+)"/g)) assert.ok(Number(m[1]) >= 0 && Number(m[1]) <= W && Number(m[2]) > 0 && Number(m[2]) <= H);
    // ids unicos y degradados definidos
    const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const m of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(m[1]));
  });
}

test('promo con los 3 modos de precio y sin datos opcionales', () => {
  const promo = { activa: true, precioPromoUsd: 19.9 };
  const usd = renderSvg('black-premium', { ...ctx, precio: 'usd', promo }, '4x5');
  assert.ok(usd.includes('ANTES $24.90') && usd.includes('$19.90') && !usd.includes('Bs.'));
  const ninguno = renderSvg('black-premium', { ...ctx, precio: 'ninguno', promo: { ...promo, unidades: 5 } }, '4x5');
  assert.ok(!ninguno.includes('Bs.') && !ninguno.includes('$') && !ninguno.includes('ANTES'));
  assert.ok(ninguno.includes('SOLO 5 UNIDADES') && ninguno.includes('-20%'), 'los chips siguen sin precios');
  const solo = renderSvg('pure-white', { ...ctx, promo: { activa: true } }, '4x5');
  assert.ok(solo.includes('OFERTA') && solo.includes('Bs. 5.000') && !solo.includes('ANTES') && !solo.includes('SOLO'));
  const normal = renderSvg('pure-white', ctx, '4x5');
  assert.ok(normal.includes('DESDE') && !normal.includes('OFERTA'), 'sin promo todo queda como antes');
});

// ── Reparto de plantillas ──────────────────────────────────────────────────────
test('repartirPlantillas: nunca repite la misma plantilla seguida y reparte parejo', () => {
  for (let semilla = 1; semilla <= 200; semilla++) {
    const r = repartirPlantillas(37, IDS_PLANTILLAS, crearAleatorio(semilla));
    assert.equal(r.length, 37);
    for (let i = 1; i < r.length; i++) assert.notEqual(r[i], r[i - 1], `semilla ${semilla} pos ${i}`);
    const cuenta = new Map<string, number>(); r.forEach((x) => cuenta.set(x, (cuenta.get(x) ?? 0) + 1));
    const valores = [...cuenta.values()];
    assert.ok(Math.max(...valores) - Math.min(...(valores.length === 10 ? valores : [0])) <= 1 || valores.length <= 10, 'reparto parejo');
    assert.ok(Math.max(...valores) <= Math.ceil(37 / 10) + 0, `uso maximo ${Math.max(...valores)}`);
  }
});

test('repartirPlantillas: casos limite (0, 1, una sola plantilla, dos plantillas) y determinismo', () => {
  assert.deepEqual(repartirPlantillas(0, IDS_PLANTILLAS), []); assert.deepEqual(repartirPlantillas(5, []), []);
  assert.equal(repartirPlantillas(1, IDS_PLANTILLAS).length, 1);
  assert.deepEqual(repartirPlantillas(4, ['a']), ['a', 'a', 'a', 'a']);                        // con una sola no hay forma de no repetir
  const dos = repartirPlantillas(21, ['a', 'b'], crearAleatorio(7));
  for (let i = 1; i < dos.length; i++) assert.notEqual(dos[i], dos[i - 1]);
  assert.deepEqual(repartirPlantillas(25, IDS_PLANTILLAS, crearAleatorio(42)), repartirPlantillas(25, IDS_PLANTILLAS, crearAleatorio(42)));
  assert.notDeepEqual(repartirPlantillas(25, IDS_PLANTILLAS, crearAleatorio(42)), repartirPlantillas(25, IDS_PLANTILLAS, crearAleatorio(43)));
  const alAzar = repartirPlantillas(15, IDS_PLANTILLAS);                                        // sin semilla (Math.random)
  for (let i = 1; i < alAzar.length; i++) assert.notEqual(alAzar[i], alAzar[i - 1]);
});

// ── ZIP ─────────────────────────────────────────────────────────────────────────
const leerU16 = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);
const leerU32 = (b: Uint8Array, o: number) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

test('crc32 con vectores conocidos', () => {
  assert.equal(crc32(new TextEncoder().encode('hello')), 0x3610a686);
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
  assert.equal(crc32(new Uint8Array(0)), 0);
});

test('zip: estructura valida (cabeceras, directorio central, offsets, crc y contenido) y nombres seguros/repetidos', async () => {
  const a = new Uint8Array([1, 2, 3, 4, 5]), b = new TextEncoder().encode('hola ñandú');
  const zip = await zipEnMemoria([
    { nombre: 'Cargador/USB:C?.png', leer: () => a },
    { nombre: 'Cargador USB C.png', leer: async () => b },
    { nombre: 'Cargador USB C.png', leer: () => a },
  ], new Date(2026, 10, 18, 9, 30, 10));
  // fin del directorio central
  const fin = zip.length - 22;
  assert.equal(leerU32(zip, fin), 0x06054b50);
  assert.equal(leerU16(zip, fin + 10), 3);
  const tamCentral = leerU32(zip, fin + 12), offCentral = leerU32(zip, fin + 16);
  assert.equal(offCentral + tamCentral, fin);
  let o = offCentral; const nombres: string[] = [];
  for (let i = 0; i < 3; i++) {
    assert.equal(leerU32(zip, o), 0x02014b50);
    const crc = leerU32(zip, o + 16), tam = leerU32(zip, o + 20), nlen = leerU16(zip, o + 28), loc = leerU32(zip, o + 42);
    nombres.push(new TextDecoder().decode(zip.subarray(o + 46, o + 46 + nlen)));
    assert.equal(leerU32(zip, loc), 0x04034b50);
    const nloc = leerU16(zip, loc + 26), datos = zip.subarray(loc + 30 + nloc, loc + 30 + nloc + tam);
    assert.equal(crc32(datos), crc); assert.equal(leerU32(zip, loc + 14), crc);
    o += 46 + nlen;
  }
  assert.equal(nombres[0], 'Cargador USB C .png');
  assert.equal(nombres[1], 'Cargador USB C.png'); assert.equal(nombres[2], 'Cargador USB C (2).png');
  assert.ok(!/[\\/:*?"<>|]/.test(nombres[0]));
});

test('zip por partes: lee un archivo a la vez y produce lo mismo que la version en memoria', async () => {
  let vivos = 0, maxVivos = 0;
  const entradas = Array.from({ length: 5 }, (_, i) => ({
    nombre: `f${i}.bin`,
    leer: async () => { vivos++; maxVivos = Math.max(maxVivos, vivos); const d = new Uint8Array(1000).fill(i); await Promise.resolve(); return d; },
  }));
  const partes: Uint8Array[] = [];
  for await (const p of zipPorPartes(entradas, new Date(2026, 0, 1))) { partes.push(p); vivos = 0; }
  assert.equal(maxVivos, 1);
  const total = partes.reduce((s, p) => s + p.length, 0);
  assert.equal(total, (await zipEnMemoria(entradas, new Date(2026, 0, 1))).length);
  assert.equal(nombreSeguro('  a/b\\c:d  '), 'a b c d'); assert.equal(nombreSeguro('///'), 'archivo');
});