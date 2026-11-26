// v0.8.0: modulo CATALOGO (geometria unica + portada / cabecera / pie en SVG + bytes de la fuente) y regresion cero de renderSvg.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  IDS_PLANTILLAS, renderSvg, VERSION_MOTOR, paginaDe, pxDePt, PAGINA_PT, ASPECTO_IMAGEN, renderPortada, renderCabecera, renderPie, pieEnlaces, portadaZonas, cabeceraZonas, pieZonas,
  intersecta, medir, URL_SITIO, URL_INSTAGRAM, type TamanoPagina, type PorPagina, type TemaCtx,
} from '../src/index.ts';
import { FUENTE_JAKARTA_BYTES, FUENTE_JAKARTA_FORMATO, FUENTES_PDF } from '../src/fuentes-bytes.ts';
import { FUENTES_INCRUSTADAS } from '../src/incrustadas.ts';
import { renderPortadaConFuentes, renderCabeceraConFuentes, renderPieConFuentes } from '../src/con-fuentes.ts';

const TAMANOS: TamanoPagina[] = ['carta', 'a4'], POR: PorPagina[] = [1, 2];
const NAV: TemaCtx = { id: 'navidad', semilla: 'x', productoId: 'cat' };

test('version del motor >= 0.8.0', () => assert.match(VERSION_MOTOR, /^(0\.[8-9]|[1-9]\d*\.\d+)\.\d+/));

// ── regresion: renderSvg coincide con las huellas del motor 1.0.0 (210: 10 plantillas × 3 formatos × 7 casos, con y sin tema Navidad) ──
test('renderSvg no cambia: salida identica a las huellas de v1.0.0', () => {
  const g = JSON.parse(readFileSync(new URL('./golden/1.0.0.json', import.meta.url), 'utf8')); assert.equal(g.version, '1.0.0');
  const prod = { nombre: 'Cargador Samsung 25W USB tipo C/C carga rápida', precioUsd: 12.85, fotoHref: 'data:image/png;base64,iVBORw0KGgo=', garantia: '3 meses', conector: 'usb_c', tipoAccesorio: 'cargador', categoria: 'Cargadores', marcas: ['samsung'], descripcion: 'Cargador Samsung de 25W' } as any;
  const promo = { activa: true, precioPromoUsd: 12.85, precioAnteriorUsd: 15, unidades: 8, vigenciaISO: '2026-12-31' };
  const casos: Record<string, any> = {
    usd: { precio: 'usd' }, bs: { precio: 'bs' }, ninguno: { precio: 'ninguno' }, promo: { precio: 'usd', promo },
    navSutil: { precio: 'usd', tema: { id: 'navidad', intensidad: 'sutil', semilla: 'a', productoId: 349 } }, navEq: { precio: 'bs', tema: { id: 'navidad', semilla: 'b', productoId: 349 } },
    navFestivaPromo: { precio: 'usd', promo, tema: { id: 'navidad', intensidad: 'festiva', semilla: 7, productoId: 12 } },
  };
  let n = 0;
  for (const id of IDS_PLANTILLAS) for (const f of ['4x5', '1x1', '9x16'] as const) for (const [k, c] of Object.entries(casos)) {
    assert.equal(createHash('sha256').update(renderSvg(id, { producto: prod, tasaBs: 163.33, ...c }, f)).digest('hex'), g.casos[`${id}|${f}|${k}`], `${id}|${f}|${k}`); n++;
  }
  assert.equal(n, IDS_PLANTILLAS.length * 3 * 7);
});

// ── geometria ──
test('geometria: tamaños EXACTOS de pagina Carta y A4 (vertical y horizontal)', () => {
  assert.deepEqual(PAGINA_PT, { carta: { ancho: 612, alto: 792 }, a4: { ancho: 595.28, alto: 841.89 } });
  const c = paginaDe('carta'), a = paginaDe('a4');
  assert.deepEqual([c.ancho, c.alto, c.orientacion], [612, 792, 'vertical']); assert.deepEqual([a.ancho, a.alto], [595.28, 841.89]);
  const ch = paginaDe('carta', 2), ah = paginaDe('a4', 2);
  assert.deepEqual([ch.ancho, ch.alto, ch.orientacion], [792, 612, 'horizontal']); assert.deepEqual([ah.ancho, ah.alto], [841.89, 595.28]);
  assert.equal(pxDePt(612), 1275); assert.equal(pxDePt(792), 1650); assert.equal(pxDePt(70), 146);
});

test('geometria: Carta = cabecera 70 + imagen 520×650 (4:5) + pie 72 = 792 exactos', () => {
  const g = paginaDe('carta', 1);
  assert.deepEqual(g.cabecera, { x: 0, y: 0, w: 612, h: 70 }); assert.deepEqual(g.imagenes, [{ x: 46, y: 70, w: 520, h: 650 }]); assert.deepEqual(g.pie, { x: 0, y: 720, w: 612, h: 72 });
  assert.equal(g.cabecera.h + g.imagenes[0].h + g.pie.h, 792); assert.equal(g.margenX, 46);
});

for (const t of TAMANOS) for (const p of POR) {
  test(`geometria ${t} ${p} por pagina: 4:5 exacto, dentro de la pagina, sin solaparse, centrado`, () => {
    const g = paginaDe(t, p); assert.equal(g.imagenes.length, p);
    for (const im of g.imagenes) {
      assert.equal(im.w / im.h, ASPECTO_IMAGEN, 'imagen 4:5');
      assert.ok(im.x >= 0 && im.y >= g.cabecera.h && im.x + im.w <= g.ancho && im.y + im.h <= g.pie.y + 1e-9, 'entre cabecera y pie, dentro de la pagina');
    }
    assert.ok(!intersecta(g.cabecera, g.pie)); for (const im of g.imagenes) { assert.ok(!intersecta(im, g.cabecera)); assert.ok(!intersecta(im, g.pie)); }
    if (p === 2) { const [a, b] = g.imagenes; assert.ok(a.x + a.w <= b.x && b.x - (a.x + a.w) === 24, 'hueco de 24 pt'); }
    // centradas horizontalmente: margen izquierdo = margen derecho
    const izq = g.imagenes[0].x, der = g.ancho - (g.imagenes[g.imagenes.length - 1].x + g.imagenes[0].w); assert.ok(Math.abs(izq - der) < 0.011, `${izq} vs ${der}`);
    const libre = g.pie.y - g.cabecera.h, sobra = libre - g.imagenes[0].h; assert.ok(Math.abs(g.imagenes[0].y - g.cabecera.h - sobra / 2) < 0.011, 'centrada en vertical');
    assert.equal(g.cabecera.w, g.ancho); assert.equal(g.pie.w, g.ancho); assert.equal(g.pie.y + g.pie.h, g.alto);
  });
}
test('geometria: entradas invalidas lanzan error claro', () => { assert.throws(() => paginaDe('legal' as any), /desconocido/); assert.throws(() => paginaDe('carta', 3 as any), /porPagina/); });

// ── SVG ──
const ETQ_OK = new Set(['svg', 'defs', 'linearGradient', 'radialGradient', 'stop', 'rect', 'circle', 'ellipse', 'path', 'polygon', 'polyline', 'line', 'g', 'text', 'tspan', 'image']);
function valido(s: string) {
  assert.ok(s.startsWith('<svg ') && s.endsWith('</svg>')); assert.ok(!/NaN|undefined|Infinity/.test(s));
  const pila: string[] = [];
  for (const m of s.matchAll(/<(\/?)([A-Za-z]+)([^>]*?)(\/?)>/g)) { assert.ok(ETQ_OK.has(m[2]), 'etiqueta ' + m[2]); if (m[4] === '/') continue; if (m[1]) assert.equal(pila.pop(), m[2]); else pila.push(m[2]); }
  assert.equal(pila.length, 0);
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]); for (const m of s.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(m[1]), 'degradado sin definir ' + m[1]);
  assert.equal(new Set(ids).size, ids.length, 'ids unicos'); assert.ok(!/filter=|<filter|<style|@font-face|<script/.test(s.replace(/<style>[\s\S]*?<\/style>/, '')));
}
const tam = (s: string) => ({ w: Number(/width="(\d+)"/.exec(s)![1]), h: Number(/height="(\d+)"/.exec(s)![1]), vb: /viewBox="([^"]+)"/.exec(s)![1] });
const textos = (s: string) => [...s.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);

for (const t of TAMANOS) for (const p of POR) {
  test(`piezas ${t} ${p}/pag: tamaño EXACTO (px a 150 dpi, viewBox en pt), SVG valido y determinista`, () => {
    const g = paginaDe(t, p);
    const port = renderPortada({ tipo: 'categoria', titulo: 'Cargadores y cables', fecha: '24 de noviembre de 2026' }, t, p);
    const cab = renderCabecera({ categoria: 'Cargadores', primera: true }, t, p), cab2 = renderCabecera({ categoria: 'Cargadores', primera: false }, t, p);
    const pie = renderPie({ pagina: 7, fechaPrecios: '24/11/2026' }, t, p);
    for (const s of [port, cab, cab2, pie]) valido(s);
    assert.deepEqual(tam(port), { w: pxDePt(g.ancho), h: pxDePt(g.alto), vb: `0 0 ${g.ancho} ${g.alto}` });
    assert.deepEqual(tam(cab), { w: pxDePt(g.ancho), h: pxDePt(g.cabecera.h), vb: `0 0 ${g.ancho} ${g.cabecera.h}` }); assert.deepEqual(tam(cab2), tam(cab));
    assert.deepEqual(tam(pie), { w: pxDePt(g.ancho), h: pxDePt(g.pie.h), vb: `0 0 ${g.ancho} ${g.pie.h}` });
    assert.equal(renderPortada({ tipo: 'categoria', titulo: 'Cargadores y cables', fecha: '24 de noviembre de 2026' }, t, p), port);           // determinismo
    assert.equal(renderCabecera({ categoria: 'Cargadores', primera: true }, t, p), cab); assert.equal(renderPie({ pagina: 7, fechaPrecios: '24/11/2026' }, t, p), pie);
    assert.notEqual(cab, cab2, 'la primera pagina de categoria lleva cabecera distinta');
  });
}

test('contenido: portada de categoria / inventario, cabecera y pie con los textos acordados', () => {
  const pc = textos(renderPortada({ tipo: 'categoria', titulo: 'Cargadores y cables', fecha: '24 de noviembre de 2026' }, 'carta'));
  assert.ok(pc.includes('24 de noviembre de 2026') && pc.some((x) => x.includes('CARGADORES')) && pc.includes('CATÁLOGO DE PRODUCTOS') && pc.some((x) => x.includes('visionsmart.app')));
  const pi = textos(renderPortada({ tipo: 'inventario', fecha: 'Noviembre 2026' }, 'carta'));
  assert.ok(pi.includes('CATÁLOGO') && pi.includes('VISIONSMART') && pi.includes('Noviembre 2026') && pi.includes('INVENTARIO COMPLETO'));
  assert.ok(/<image href="data:image\/png;base64,/.test(renderPortada({ tipo: 'inventario', fecha: 'x' }, 'carta')), 'logo original');
  assert.deepEqual(textos(renderCabecera({ categoria: 'Cables', primera: true }, 'carta')).filter((x) => x !== 'VISIONSMART'), ['CABLES']);
  assert.deepEqual(textos(renderCabecera({ categoria: 'Cables', primera: false }, 'carta')).filter((x) => x !== 'VISIONSMART'), ['CABLES']);
  const pie = textos(renderPie({ pagina: 12, fechaPrecios: '24/11/2026' }, 'carta'));
  assert.ok(pie.includes('visionsmart.app  ·  @visionsmart.app') && pie.includes('12') && pie.includes('Precios vigentes al 24/11/2026'));
  assert.ok(!textos(renderPie({ pagina: 1 }, 'carta')).some((x) => x.startsWith('Precios vigentes')), 'sin fecha no hay leyenda');
  assert.ok(textos(renderPie({ pagina: 0 }, 'carta')).includes('1'), 'la pagina minima es 1');
});

test('titulos largos y caracteres especiales: caben y se escapan', () => {
  const g = paginaDe('carta');
  for (const titulo of ['Accesorios para celulares, tabletas y computadoras portátiles de todas las marcas', 'Cables & Adaptadores <USB> "Tipo C"', 'X']) {
    const s = renderPortada({ tipo: 'categoria', titulo, fecha: '1 de enero de 2027' }, 'carta'); valido(s); assert.ok(!/<text[^>]*>[^<]*&(?!amp;|lt;|gt;|quot;|#)/.test(s), 'sin & sin escapar');
    for (const m of s.matchAll(/<text [^>]*font-size="([\d.]+)"[^>]*>([^<]*)<\/text>/g)) { const w = medir(m[2].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'), 'extrabold', Number(m[1])); assert.ok(w <= g.ancho - 40, `texto de ${w.toFixed(0)} pt no cabe`); }
    const c = renderCabecera({ categoria: titulo, primera: true }, 'carta'); valido(c);
    for (const m of c.matchAll(/<text [^>]*x="([\d.]+)"[^>]*font-size="([\d.]+)"[^>]*>([^<]*)<\/text>/g)) if (m[3] !== 'VISIONSMART') assert.ok(Number(m[1]) + medir(m[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'), 'extrabold', Number(m[2])) < g.ancho - g.margenX - 100, 'el titulo de cabecera deja sitio al logo');
  }
});

test('enlaces del pie: rectangulos sobre el texto (visionsmart.app y @visionsmart.app), dentro del pie', () => {
  for (const t of TAMANOS) for (const p of POR) {
    const g = paginaDe(t, p), e = pieEnlaces({ pagina: 3 }, t, p);
    for (const r of [e.sitio, e.instagram]) { assert.ok(r.x >= 0 && r.x + r.w <= g.ancho && r.y >= g.pie.y && r.y + r.h <= g.pie.y + g.pie.h, `${t} ${p}`); assert.ok(r.w > 40 && r.h > 6); }
    assert.ok(e.sitio.x + e.sitio.w < e.instagram.x, 'sitio a la izquierda de instagram y sin tocarse');
    // el texto completo esta centrado: el rectangulo del sitio + separador + instagram cubren la linea
    const total = medir('visionsmart.app  ·  @visionsmart.app', 'regular', Math.round(g.pie.h * 0.135 * 10) / 10); assert.ok(Math.abs((e.instagram.x + e.instagram.w - e.sitio.x) - total) < 0.2);
  }
  assert.equal(URL_SITIO, 'https://visionsmart.app'); assert.equal(URL_INSTAGRAM, 'https://instagram.com/visionsmart.app');
});

// ── tema Navidad en las piezas del catalogo ──
test('tema Navidad: capa sobre portada / cabecera / pie, SVG valido, determinista y SIN invadir zonas protegidas', () => {
  for (const t of TAMANOS) for (const p of POR) for (const inten of ['sutil', 'equilibrada', 'festiva'] as const) for (const semilla of ['a', 'b', 'c']) {
    const tema: TemaCtx = { ...NAV, intensidad: inten, semilla };
    const casos: [string, string, string, { nombre: string; caja: any }[]][] = [
      ['portada', renderPortada({ tipo: 'categoria', titulo: 'Cargadores', fecha: '24 de noviembre de 2026', tema }, t, p), renderPortada({ tipo: 'categoria', titulo: 'Cargadores', fecha: '24 de noviembre de 2026' }, t, p), portadaZonas({ tipo: 'categoria', titulo: 'Cargadores', fecha: '24 de noviembre de 2026' }, t, p)],
      ['cabecera', renderCabecera({ categoria: 'Cargadores', primera: true, tema }, t, p), renderCabecera({ categoria: 'Cargadores', primera: true }, t, p), cabeceraZonas({ categoria: 'Cargadores', primera: true }, t, p)],
      ['pie', renderPie({ pagina: 4, fechaPrecios: '24/11/2026', tema }, t, p), renderPie({ pagina: 4, fechaPrecios: '24/11/2026' }, t, p), pieZonas({ pagina: 4, fechaPrecios: '24/11/2026' }, t, p)],
    ];
    for (const [nombre, con, sin, zonas] of casos) {
      valido(con); assert.ok(con.length >= sin.length);
      assert.ok(con.startsWith(sin.slice(0, -'</svg>'.length)) || nombre === 'pie', `${nombre}: la pieza queda intacta bajo la capa`);
      assert.deepEqual(tam(con), tam(sin));
    }
    assert.equal(renderPortada({ tipo: 'inventario', fecha: 'x', tema }, t, p), renderPortada({ tipo: 'inventario', fecha: 'x', tema }, t, p));
  }
});

import { capaTemaCatalogo } from '../src/catalogo/tema.ts';
test('tema en catalogo: ninguna caja decorativa cruza las zonas de texto / logo (portada, cabecera y pie)', () => {
  let cajasTotal = 0;
  for (const t of TAMANOS) for (const p of POR) for (const inten of ['sutil', 'equilibrada', 'festiva'] as const) for (const semilla of ['a', 'b', 'c', 'd']) {
    const g = paginaDe(t, p), tema: TemaCtx = { ...NAV, intensidad: inten, semilla };
    const piezas: [number, number, { nombre: string; caja: any }[], string][] = [
      [g.ancho, g.alto, portadaZonas({ tipo: 'categoria', titulo: 'Cargadores y cables', fecha: '24 de noviembre de 2026' }, t, p), 'catalogo-portada-categoria'],
      [g.ancho, g.cabecera.h, cabeceraZonas({ categoria: 'Cargadores', primera: true }, t, p), 'catalogo-cabecera-primera'],
      [g.ancho, g.pie.h, pieZonas({ pagina: 2, fechaPrecios: '24/11/2026' }, t, p), 'catalogo-pie'],
    ];
    for (const [w, h, zonas, id] of piezas) {
      const capa = capaTemaCatalogo(tema, w, h, zonas, id);
      for (const c of capa.cajas) {
        cajasTotal++; assert.ok(c.caja.x >= -0.01 && c.caja.y >= -0.01 && c.caja.x + c.caja.w <= w + 0.01 && c.caja.y + c.caja.h <= h + 0.01, `${id}: ${c.tipo} dentro de la pieza`);
        for (const z of zonas) assert.ok(!intersecta(c.caja, z.caja, 0), `${id} ${t} ${p} ${inten} ${semilla}: ${c.tipo} invade «${z.nombre}»`);
      }
    }
  }
  assert.ok(cajasTotal > 200, 'hay decoracion real que verificar: ' + cajasTotal);
});

test('tema: sin tema o tema desconocido la pieza no cambia', () => {
  const base = renderPortada({ tipo: 'inventario', fecha: 'Noviembre 2026' }, 'carta');
  assert.equal(renderPortada({ tipo: 'inventario', fecha: 'Noviembre 2026', tema: null }, 'carta'), base);
  assert.equal(renderPortada({ tipo: 'inventario', fecha: 'Noviembre 2026', tema: { id: 'no-existe' } as any }, 'carta'), base);
  assert.notEqual(renderPortada({ tipo: 'inventario', fecha: 'Noviembre 2026', tema: NAV }, 'carta'), base);
});

// ── variantes con fuentes (Sistema PC) ──
test('variantes ...ConFuentes: igual + las 3 fuentes incrustadas', () => {
  const s = renderPieConFuentes({ pagina: 1 }, 'carta'); valido(s.replace(/<style>[\s\S]*?<\/style>/, ''));
  assert.ok(s.includes('@font-face') && s.includes('Jakarta-ExtraBold') && s.includes('Jakarta-Bold') && s.includes('Jakarta-Regular'));
  assert.ok(renderPortadaConFuentes({ tipo: 'inventario', fecha: 'x' }, 'a4').includes('@font-face') && renderCabeceraConFuentes({ categoria: 'A', primera: false }, 'a4', 2).includes('@font-face'));
});

// ── bytes de la fuente (PDFKit) ──
test('fuente de marca: TTF reales (cabecera 0x00010000), sin base64, distintos y cacheados', () => {
  assert.equal(FUENTE_JAKARTA_FORMATO, 'ttf');
  for (const k of ['regular', 'bold', 'extrabold'] as const) {
    const b = FUENTE_JAKARTA_BYTES[k]; assert.ok(b instanceof Uint8Array && b.length > 50_000, `${k}: ${b.length} bytes`);
    assert.deepEqual([...b.slice(0, 4)], [0, 1, 0, 0], 'cabecera TrueType'); assert.equal(Buffer.from(b).toString('base64'), FUENTES_INCRUSTADAS[k].base64, 'son exactamente las fuentes de las plantillas');
    assert.equal(FUENTE_JAKARTA_BYTES[k], b, 'se decodifica una sola vez'); assert.equal(FUENTES_PDF[k].nombre, FUENTES_INCRUSTADAS[k].familia);
  }
  assert.notEqual(Buffer.from(FUENTE_JAKARTA_BYTES.regular).toString('hex', 0, 64) + FUENTE_JAKARTA_BYTES.regular.length, Buffer.from(FUENTE_JAKARTA_BYTES.bold).toString('hex', 0, 64) + FUENTE_JAKARTA_BYTES.bold.length);
});