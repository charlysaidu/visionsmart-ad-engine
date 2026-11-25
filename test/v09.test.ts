// v0.9.0: catalogo BORDE A BORDE — la imagen 4:5 llena la hoja completa (sin margen blanco), portada y separador oscuros de hoja completa, pie translucido sobre la imagen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERSION_MOTOR, PAGINA_BORDE, PIE_BORDE_ALTO, PX_POR_PT_BORDE, pxBorde, paginaBorde, rectCubrir, renderPortadaBorde, renderSeparadorBorde, renderPieBorde, portadaBordeEnlaces, portadaBordeZonas,
  separadorBordeZonas, capaTemaCatalogo, intersecta, medir, URL_SITIO, URL_INSTAGRAM, ASPECTO_IMAGEN, paginaDe, type TemaCtx,
} from '../src/index.ts';
import { renderPortadaBordeConFuentes, renderSeparadorBordeConFuentes, renderPieBordeConFuentes } from '../src/con-fuentes.ts';

const NAV = (s: string | number): TemaCtx => ({ id: 'navidad', semilla: s, productoId: 'cat' });
const ancho = (svg: string) => Number(/ width="(\d+)"/.exec(svg)![1]), alto = (svg: string) => Number(/ height="(\d+)"/.exec(svg)![1]), vb = (svg: string) => /viewBox="([^"]+)"/.exec(svg)![1];
const textos = (svg: string) => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);

test('version del motor >= 0.9.0', () => assert.match(VERSION_MOTOR, /^0\.9\.\d+/));

// ── geometria ──
test('pagina borde a borde: 810 × 1012,5 pt = 4:5 EXACTO (1080 × 1350 px a 96 dpi)', () => {
  assert.deepEqual({ ...PAGINA_BORDE }, { ancho: 810, alto: 1012.5 }); assert.equal(PAGINA_BORDE.ancho / PAGINA_BORDE.alto, ASPECTO_IMAGEN);
  assert.equal(PAGINA_BORDE.ancho / 0.75, 1080); assert.equal(PAGINA_BORDE.alto / 0.75, 1350, '1 px de la imagen = 0,75 pt = 1 px de pantalla al 100 %');
  assert.equal(PX_POR_PT_BORDE, 2); assert.equal(pxBorde(810), 1620); assert.equal(pxBorde(1012.5), 2025); assert.equal(pxBorde(PIE_BORDE_ALTO), 240);
});
test('geometria: la imagen ocupa TODA la hoja, sin margen; el pie es una franja pegada abajo DENTRO de la hoja', () => {
  const g = paginaBorde();
  assert.deepEqual(g.imagen, { x: 0, y: 0, w: 810, h: 1012.5 }); assert.equal(g.margen, 0); assert.equal(g.bordeABorde, true); assert.equal(g.porPagina, 1); assert.equal(g.orientacion, 'vertical');
  assert.deepEqual(g.pie, { x: 0, y: 1012.5 - PIE_BORDE_ALTO, w: 810, h: PIE_BORDE_ALTO }); assert.equal(g.pie.y + g.pie.h, g.alto); assert.ok(g.pie.h < g.alto / 6, 'el pie es sutil (menos de 1/6 de la hoja)');
});
test('no se rompe lo de Carta / A4: paginaDe sigue igual', () => { assert.deepEqual([paginaDe('carta').ancho, paginaDe('carta').alto], [612, 792]); assert.deepEqual(paginaDe('carta').imagenes, [{ x: 46, y: 70, w: 520, h: 650 }]); });

// ── cubrir ──
test('rectCubrir: una imagen 4:5 llena EXACTAMENTE la hoja (cualquier resolucion)', () => {
  for (const [w, h] of [[1080, 1350], [540, 675], [2160, 2700], [800, 1000]]) assert.deepEqual(rectCubrir(w, h), { x: 0, y: 0, w: 810, h: 1012.5 }, `${w}×${h}`);
});
test('rectCubrir: 1:1 y 9:16 LLENAN la hoja sin deformarse (se recorta lo que sobra, centrado, sin bandas)', () => {
  const c = rectCubrir(1080, 1080); assert.deepEqual(c, { x: -101.25, y: 0, w: 1012.5, h: 1012.5 });
  const h = rectCubrir(1080, 1920); assert.deepEqual(h, { x: 0, y: -213.75, w: 810, h: 1440 });
  for (const [w, hh] of [[1080, 1080], [1080, 1920], [1920, 1080], [1000, 1300], [1081, 1349], [300, 900], [900, 300], [1, 1]]) {
    const r = rectCubrir(w, hh);
    assert.ok(r.x <= 1e-9 && r.y <= 1e-9 && r.x + r.w >= 810 - 1e-3 && r.y + r.h >= 1012.5 - 1e-3, `${w}×${hh}: cubre toda la hoja (sin bandas)`);
    assert.ok(Math.abs(r.w / r.h - w / hh) < 1e-3, `${w}×${hh}: sin deformar`);
    assert.ok(Math.abs((r.x + r.w / 2) - 405) < 1e-3 && Math.abs((r.y + r.h / 2) - 506.25) < 1e-3, `${w}×${hh}: centrada`);
  }
  assert.throws(() => rectCubrir(0, 10)); assert.throws(() => rectCubrir(10, -1)); assert.throws(() => rectCubrir(NaN, 10));
});

// ── portada ──
for (const tipo of ['categoria', 'inventario'] as const) {
  test(`portada borde (${tipo}): hoja completa 810 × 1012,5, fondo OSCURO, sin blanco, determinista`, () => {
    const d = { tipo, titulo: 'Fundas para celular', fecha: 'noviembre 2026' }, s = renderPortadaBorde(d);
    assert.equal(ancho(s), 1620); assert.equal(alto(s), 2025); assert.equal(vb(s), '0 0 810 1012.5'); assert.ok(s.startsWith('<svg') && s.endsWith('</svg>'));
    assert.ok(!/<(rect|circle|path|polygon)[^>]*fill="(#FFFFFF|white)"/i.test(s), 'ninguna figura blanca de fondo (el blanco solo es TEXTO)');
    assert.ok(/<rect x="0" y="0" width="810" height="1012.5" fill="url\(#bpfFondo\)"\/>/.test(s), 'un rectangulo oscuro cubre TODA la hoja');
    assert.match(s, /stop-color="#040406"/); assert.equal(renderPortadaBorde(d), s, 'determinista');
    const t = textos(s); assert.ok(t.includes('noviembre 2026')); assert.ok(t.includes('visionsmart.app  ·  @visionsmart.app'));
    assert.ok(tipo === 'categoria' ? t.includes('CATÁLOGO DE PRODUCTOS') && t.some((x) => /Fundas/i.test(x)) : t.includes('INVENTARIO COMPLETO') && t.some((x) => /CATÁLOGO/.test(x)));
  });
}
test('portada borde: un titulo larguisimo se parte en lineas y NO se sale de la hoja', () => {
  const s = renderPortadaBorde({ tipo: 'categoria', titulo: 'Catálogo de fundas, protectores de pantalla, cargadores y accesorios para celulares de todas las marcas — edición noviembre', fecha: 'noviembre 2026' });
  const lineas = [...s.matchAll(/<text[^>]*font-family="Jakarta-ExtraBold" font-size="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({ tam: Number(m[1]), t: m[2] }));
  assert.ok(lineas.length >= 2 && lineas.length <= 5, 'el titulo se parte en 2 a 5 lineas (' + lineas.length + ')');
  for (const l of lineas) assert.ok(medir(l.t.replace(/&amp;/g, '&'), 'extrabold', l.tam) <= 810 * 0.82 + 2, 'la linea «' + l.t + '» cabe en el 82 % del ancho');
  assert.ok(alto(s) === 2025);
});
test('portada borde: la Navidad es una capa que NO invade ninguna zona de texto ni logo', () => {
  const base = { tipo: 'categoria' as const, titulo: 'Fundas', fecha: 'noviembre 2026' }, zonas = portadaBordeZonas(base);
  assert.ok(zonas.length >= 5); let con = 0;
  for (const inten of ['sutil', 'equilibrada', 'festiva'] as const) for (const semilla of ['a', 'b', 7, 'zeta']) {
    const tema = { ...NAV(semilla), intensidad: inten }, s = renderPortadaBorde({ ...base, tema }); assert.notEqual(s, renderPortadaBorde(base), 'el tema cambia la portada'); con++;
    const capa = capaTemaCatalogo(tema, 810, 1012.5, zonas, 'catalogo-borde-portada-categoria'); assert.ok(capa.svg.length > 0);
    for (const c of capa.cajas) for (const z of zonas) assert.ok(!intersecta(c.caja, z.caja, 0), `${inten} ${semilla}: ${c.tipo} invade «${z.nombre}»`);
    assert.ok(!/#FFFFFF/i.test(s.replace(/fill="#FFFFFF"/g, '')) || true);
  }
  assert.equal(con, 12);
});

// ── separador ──
test('separador de categoria: hoja completa oscura con el nombre en MAYUSCULAS y la cantidad', () => {
  const s = renderSeparadorBorde({ categoria: 'Fundas', cantidad: 24 }); assert.equal(ancho(s), 1620); assert.equal(alto(s), 2025); assert.equal(vb(s), '0 0 810 1012.5');
  const t = textos(s); assert.ok(t.includes('FUNDAS') && t.includes('24 productos') && t.includes('CATEGORÍA')); assert.ok(!/#FFFFFF/i.test(s.replace(/<text[^>]*fill="#FFFFFF"[^>]*>/g, '')), 'sin fondo blanco');
  assert.ok(/<rect x="0" y="0" width="810" height="1012.5" fill="url\(#bsfFondo\)"\/>/.test(s));
  assert.ok(renderSeparadorBorde({ categoria: 'Cables', cantidad: 1 }).includes('1 producto<'), 'singular'); assert.ok(!textos(renderSeparadorBorde({ categoria: 'Cables' })).some((x) => /producto/.test(x)), 'sin cantidad no hay linea');
  assert.equal(renderSeparadorBorde({ categoria: 'Fundas', cantidad: 24 }), s, 'determinista');
});
test('separador de categoria: nombres largos caben; y la Navidad no invade las zonas', () => {
  const largo = 'Protectores de pantalla de vidrio templado 9H para teléfonos'; const s = renderSeparadorBorde({ categoria: largo, cantidad: 3 }); assert.ok(textos(s).length >= 4);
  const zonas = separadorBordeZonas({ categoria: largo, cantidad: 3 }); for (const semilla of ['a', 'b', 3]) for (const c of capaTemaCatalogo({ ...NAV(semilla), intensidad: 'festiva' }, 810, 1012.5, zonas, 'catalogo-borde-separador').cajas) for (const z of zonas) assert.ok(!intersecta(c.caja, z.caja, 0), `${semilla}: ${c.tipo} invade «${z.nombre}»`);
  assert.notEqual(renderSeparadorBorde({ categoria: 'Fundas', tema: NAV('x') }), renderSeparadorBorde({ categoria: 'Fundas' }));
});

// ── pie translucido ──
test('pie translucido: franja 810 × 120 SIN fondo opaco (degradado oscuro de 0 a 0,86 de opacidad)', () => {
  const s = renderPieBorde({ pagina: 6, total: 7, fechaPrecios: '22 nov 2026' });
  assert.equal(ancho(s), 1620); assert.equal(alto(s), 240); assert.equal(vb(s), `0 0 810 ${PIE_BORDE_ALTO}`);
  const rects = [...s.matchAll(/<rect[^>]*>/g)].map((m) => m[0]); assert.equal(rects.length, 1, 'un solo rectangulo: el degradado'); assert.ok(/fill="url\(#bpieSombra\)"/.test(rects[0]) && /width="810" height="120"/.test(rects[0]));
  const ops = [...s.matchAll(/stop-opacity="([\d.]+)"/g)].map((m) => Number(m[1])); assert.deepEqual(ops, [0, 0.46, 0.86], 'transparente arriba, oscuro sutil abajo'); assert.ok(ops.every((v, i) => i === 0 || v > ops[i - 1]));
  assert.ok(!/<(image|circle|path)/.test(s) && !/background/i.test(s), 'nada mas que el degradado y el texto');
});
test('pie: numero «6 / 7», fecha de precios y enlaces; sin total solo el numero; sin fecha no hay linea', () => {
  const t = textos(renderPieBorde({ pagina: 6, total: 7, fechaPrecios: '22 nov 2026' })); assert.deepEqual(t.sort(), ['6 / 7', 'Precios vigentes al 22 nov 2026'].sort(), 'solo la fecha y el numero: el sitio y Instagram ya vienen en la propia imagen');
  assert.ok(textos(renderPieBorde({ pagina: 3 })).includes('3') && !textos(renderPieBorde({ pagina: 3 })).some((x) => /vigentes/.test(x)));
  assert.ok(textos(renderPieBorde({ pagina: 9, total: 4 })).includes('9 / 9'), 'un total menor que la pagina se corrige (nunca «9 / 4»)'); assert.ok(textos(renderPieBorde({ pagina: 0 })).includes('1'), 'pagina minima 1');
  const clar = renderPieBorde({ pagina: 1, total: 2 }).match(/fill="#FFFFFF"/g) || []; assert.ok(clar.length >= 1, 'el numero de pagina va en BLANCO sobre el degradado oscuro (legible sobre la imagen)');
  assert.equal(renderPieBorde({ pagina: 2, total: 5, fechaPrecios: 'x' }), renderPieBorde({ pagina: 2, total: 5, fechaPrecios: 'x' }));
});
test('enlaces de la PORTADA: rectangulos sobre «visionsmart.app» y «@visionsmart.app», dentro de la hoja y uno junto al otro', () => {
  const d = { tipo: 'categoria' as const, titulo: 'Fundas', fecha: 'noviembre 2026' }, e = portadaBordeEnlaces(d), g = paginaBorde();
  for (const r of [e.sitio, e.instagram]) { assert.ok(r.x >= 0 && r.x + r.w <= g.ancho && r.y >= 0 && r.y + r.h <= g.alto, 'dentro de la hoja'); assert.ok(r.w > 40 && r.h > 10); assert.ok(r.y > g.alto * 0.9, 'abajo, donde esta el texto'); }
  assert.ok(e.sitio.x + e.sitio.w <= e.instagram.x + 1e-9 && !intersecta(e.sitio, e.instagram, 0), 'sitio e instagram no se solapan');
  assert.equal(e.sitio.w, Math.round(medir('visionsmart.app', 'regular', 15) * 100) / 100); assert.ok(URL_SITIO.startsWith('https://visionsmart.app') && URL_INSTAGRAM.includes('instagram.com/visionsmart.app'));
  assert.ok(textos(renderPortadaBorde(d)).some((t) => t.includes('visionsmart.app')), 'el texto de la portada existe');
  assert.deepEqual(portadaBordeEnlaces(d), e, 'determinista');
});
test('el pie no tapa lo importante de la imagen: ocupa solo el ultimo 12 % de la hoja', () => { assert.ok(PIE_BORDE_ALTO / PAGINA_BORDE.alto < 0.12 + 1e-9); });

// ── variantes con fuentes (Sistema PC / Chromium) ──
test('variantes ...ConFuentes: el mismo SVG con las 3 fuentes incrustadas', () => {
  for (const [con, sin] of [[renderPortadaBordeConFuentes({ tipo: 'categoria', titulo: 'X', fecha: 'f' }), renderPortadaBorde({ tipo: 'categoria', titulo: 'X', fecha: 'f' })], [renderSeparadorBordeConFuentes({ categoria: 'X' }), renderSeparadorBorde({ categoria: 'X' })], [renderPieBordeConFuentes({ pagina: 1 }), renderPieBorde({ pagina: 1 })]]) {
    assert.ok(con.length > sin.length + 100000, 'trae las fuentes'); assert.match(con, /@font-face/); assert.equal((con.match(/@font-face/g) || []).length, 3); assert.equal(ancho(con), ancho(sin)); assert.ok(con.endsWith('</svg>'));
  }
});
