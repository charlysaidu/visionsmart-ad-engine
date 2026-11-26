// v1.4.0: PORTADA PREMIUM del catalogo borde a borde (estilo: 'premium'): degradado de marca #1367A4 → #9D40CB, logo en circulo blanco, titulo gigante por tipo, subtitulo, fecha larga,
// numero de productos, decoracion translucida y pie con enlaces. La portada oscura de 0.9.0 (sin `estilo`) queda BYTE-IDENTICA.
import test from 'node:test';
import assert from 'node:assert/strict';
import { VERSION_MOTOR, renderPortadaBorde, portadaBordeEnlaces, portadaBordeZonas, capaTemaCatalogo, intersecta, medir, textoCantidadProductos, SUBTITULO_PORTADA, type TemaCtx } from '../src/index.ts';
import { renderPortadaBordeConFuentes } from '../src/con-fuentes.ts';

const textos = (svg: string) => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
const grandes = (svg: string) => [...svg.matchAll(/<text[^>]*font-family="Jakarta-ExtraBold" font-size="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({ tam: Number(m[1]), t: m[2] }));
const FECHA = '26 de noviembre de 2026';
const base = { estilo: 'premium' as const, fecha: FECHA, cantidad: 57 };

test('version del motor >= 1.4.0', () => assert.match(VERSION_MOTOR, /^(1\.([4-9]|\d{2,})|[2-9])\.\d+/));

test('premium: hoja 810 × 1012,5 (1620 × 2025 px), degradado azul → morado de marca, determinista', () => {
  const s = renderPortadaBorde({ ...base, tipo: 'categoria', titulo: 'Audífonos' });
  assert.match(s, /width="1620" height="2025" viewBox="0 0 810 1012.5"/);
  assert.match(s, /<linearGradient id="ppFondo"[^>]*><stop offset="0" stop-color="#1367A4"\/><stop offset="1" stop-color="#9D40CB"\/>/, 'degradado corporativo');
  assert.ok(s.includes('<rect x="0" y="0" width="810" height="1012.5" fill="url(#ppFondo)"/>'), 'el degradado cubre TODA la hoja');
  assert.ok(!s.includes('#040406'), 'nada del fondo oscuro antiguo');
  assert.equal(renderPortadaBorde({ ...base, tipo: 'categoria', titulo: 'Audífonos' }), s);
});
test('premium: logo del ojo dentro de un CIRCULO BLANCO, grande y centrado arriba', () => {
  const s = renderPortadaBorde({ ...base, tipo: 'inventario' });
  const circ = /<circle cx="405" cy="232" r="124" fill="#FFFFFF"\/>/.exec(s); assert.ok(circ, 'circulo blanco centrado (r = 124 pt ≈ 33 % del ancho)');
  assert.ok(s.indexOf(circ![0]) < s.indexOf('<image href="data:image/png;base64,'), 'el circulo va DEBAJO del logo');
  const im = /<image href="data:image\/png;base64,[^"]+" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/.exec(s)!; assert.equal(Number(im[1]) + Number(im[3]) / 2, 405, 'logo centrado'); assert.ok(Number(im[3]) >= 170, 'logo grande');
});
test('premium: el titulo depende del tipo — categoria en MAYUSCULAS, inventario «CATÁLOGO COMPLETO», lote «CATÁLOGO»', () => {
  const t = (d: object) => grandes(renderPortadaBorde({ ...base, ...d } as never)).map((x) => x.t);
  assert.deepEqual(t({ tipo: 'categoria', titulo: 'Audífonos' }), ['AUDÍFONOS']); assert.deepEqual(t({ tipo: 'categoria', titulo: 'cargadores' }), ['CARGADORES']);
  assert.deepEqual(t({ tipo: 'inventario' }), ['CATÁLOGO', 'COMPLETO'].length === 2 && t({ tipo: 'inventario' }).join(' ') === 'CATÁLOGO COMPLETO' ? t({ tipo: 'inventario' }) : ['??']);
  assert.equal(t({ tipo: 'inventario' }).join(' '), 'CATÁLOGO COMPLETO'); assert.deepEqual(t({ tipo: 'lote' }), ['CATÁLOGO']);
  assert.deepEqual(t({ tipo: 'categoria', titulo: '' }), ['CATÁLOGO'], 'categoria sin nombre → «CATÁLOGO»');
  const gig = grandes(renderPortadaBorde({ ...base, tipo: 'categoria', titulo: 'Audífonos' }))[0]; assert.ok(gig.tam >= 90, 'titulo gigante (' + gig.tam + ' pt)');
});
test('premium: subtitulo, fecha larga, cantidad en «pastilla» y pie con los dos enlaces', () => {
  const s = renderPortadaBorde({ ...base, tipo: 'categoria', titulo: 'Audífonos' }), t = textos(s);
  assert.ok(t.includes('VisionSmart · Tecnología y accesorios') && SUBTITULO_PORTADA === 'VisionSmart · Tecnología y accesorios');
  assert.ok(t.includes(FECHA)); assert.ok(t.includes('57 productos')); assert.ok(t.includes('visionsmart.app  ·  @visionsmart.app'));
  assert.ok(/<rect [^>]*rx="21"[^>]*fill-opacity="0.18"/.test(s), 'pastilla translucida detras de la cantidad');
  assert.ok(textos(renderPortadaBorde({ ...base, cantidad: 1, tipo: 'lote' })).includes('1 producto'), 'singular');
  assert.ok(!textos(renderPortadaBorde({ ...base, cantidad: undefined, tipo: 'lote' })).some((x) => /producto/.test(x)), 'sin cantidad no se pinta nada');
  assert.equal(textoCantidadProductos(57), '57 productos'); assert.equal(textoCantidadProductos(0), ''); assert.equal(textoCantidadProductos(null), ''); assert.equal(textoCantidadProductos(1), '1 producto');
});
test('premium: decoracion translucida (puntos y arcos) y NINGUN texto fuera de la hoja', () => {
  const s = renderPortadaBorde({ ...base, tipo: 'categoria', titulo: 'Audífonos' });
  assert.ok((s.match(/<circle [^>]*r="(3.4|2.4)"[^>]*fill-opacity=/g) ?? []).length === 72, 'dos mallas de 6 × 6 puntos');
  assert.ok((s.match(/stroke-opacity="0.1/g) ?? []).length >= 4, 'arcos finos translucidos');
  for (const m of s.matchAll(/<text x="([\d.]+)" y="([\d.]+)"/g)) assert.ok(Number(m[2]) > 0 && Number(m[2]) < 1012.5 && Number(m[1]) === 405, 'texto centrado dentro de la hoja');
});
test('premium: un titulo larguisimo se parte en lineas, cabe en el 84 % del ancho y no choca con el logo ni con la fecha', () => {
  const titulo = 'Fundas, protectores de pantalla, cargadores y accesorios para celulares de todas las marcas';
  const d = { ...base, tipo: 'categoria' as const, titulo }, s = renderPortadaBorde(d), L = grandes(s);
  assert.ok(L.length >= 2 && L.length <= 5, 'lineas: ' + L.length);
  for (const l of L) assert.ok(medir(l.t.replace(/&amp;/g, '&'), 'extrabold', l.tam) <= 810 * 0.84 + 2, 'cabe: ' + l.t);
  const z = Object.fromEntries(portadaBordeZonas(d).map((x) => [x.nombre, x.caja]));
  assert.ok(!intersecta(z.logo, z.titulo, 0) && !intersecta(z.titulo, z.subtitulo, 0) && !intersecta(z.subtitulo, z.fecha, 0) && !intersecta(z.fecha, z.cantidad, 0) && !intersecta(z.cantidad, z.pie, 0), 'zonas apiladas sin solaparse');
  assert.ok(z.pie.y + z.pie.h < 1012.5, 'el pie cabe en la hoja');
});
test('premium: enlaces clicables del pie (sitio e Instagram) dentro de la hoja y sobre el texto', () => {
  const e = portadaBordeEnlaces({ ...base, tipo: 'lote' }), z = portadaBordeZonas({ ...base, tipo: 'lote' }).find((x) => x.nombre === 'pie')!;
  for (const r of [e.sitio, e.instagram]) assert.ok(r.x >= z.caja.x && r.x + r.w <= z.caja.x + z.caja.w + 1 && r.y >= z.caja.y && r.y + r.h <= z.caja.y + z.caja.h + 1);
  assert.ok(e.sitio.x + e.sitio.w <= e.instagram.x, 'no se pisan');
});
test('premium: la Navidad sigue siendo una capa que NO invade ninguna zona', () => {
  const d = { ...base, tipo: 'categoria' as const, titulo: 'Audífonos' }, zonas = portadaBordeZonas(d); let con = 0;
  for (const inten of ['sutil', 'equilibrada', 'festiva'] as const) for (const semilla of ['a', 7, 'zeta']) {
    const tema: TemaCtx = { id: 'navidad', semilla, productoId: 'cat', intensidad: inten }, capa = capaTemaCatalogo(tema, 810, 1012.5, zonas, 'catalogo-borde-portada-categoria');
    assert.notEqual(renderPortadaBorde({ ...d, tema }), renderPortadaBorde(d)); con++;
    for (const c of capa.cajas) for (const z of zonas) assert.ok(!intersecta(c.caja, z.caja, 0), `${inten} ${semilla}: ${c.tipo} invade «${z.nombre}»`);
  }
  assert.equal(con, 9);
});
test('compatibilidad: SIN `estilo` la portada oscura de 0.9.0 es la de siempre (misma salida)', () => {
  const s = renderPortadaBorde({ tipo: 'categoria', titulo: 'Fundas', fecha: 'noviembre 2026' });
  assert.match(s, /stop-color="#040406"/); assert.ok(s.includes('CATÁLOGO DE PRODUCTOS')); assert.ok(!s.includes('ppFondo'));
  assert.equal(renderPortadaBorde({ tipo: 'categoria', titulo: 'Fundas', fecha: 'noviembre 2026', estilo: undefined }), s);
});
test('con fuentes incrustadas: mismo SVG + @font-face', () => {
  const sin = renderPortadaBorde({ ...base, tipo: 'lote' }), con = renderPortadaBordeConFuentes({ ...base, tipo: 'lote' });
  assert.ok(con.length > sin.length && con.includes('@font-face') && con.includes('ppFondo'));
});
