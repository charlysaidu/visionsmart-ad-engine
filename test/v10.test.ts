// v1.0.0: REDISENO de las 10 plantillas (mismos IDs). Pruebas del CONTRATO: 4:5 1080×1350 borde a borde (R20), producto sin deformar, logo original intacto,
// paleta corporativa, Navidad compatible, promocion legible y personalidad propia de cada plantilla.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  VERSION_MOTOR, renderSvg, IDS_PLANTILLAS, PLANTILLAS, FORMATOS, layoutDe, plantillaDe, varianteSugerida, zonasProtegidas, capaDeTema, intersecta,
  PAGINA_BORDE, PIE_BORDE_ALTO, medir, INTENSIDADES, type Formato, type PlantillaId, type TemaCtx,
} from '../src/index.ts';
import { esColorClaro, type Dibujo } from '../src/primitivas.ts';
import { LIMITE_CONTENIDO_4X5 } from '../src/layouts.ts';
import { LOGO_SIMBOLO_HREF, LOGO_SIMBOLO_SHA256 } from '../src/logo.ts';
import { FUENTE_JAKARTA } from '../src/tipos.ts';

const FOTO = 'data:image/png;base64,iVBORw0KGgo=';
const FORMS = ['4x5', '1x1', '9x16'] as const;
const NOMBRES = ['Cargador 45W', 'Cargador Samsung 45W USB-C', 'Audifonos Bluetooth Inalambricos Premium con Cancelacion de Ruido y Estuche de Carga Rapida'];
const prod = (nombre: string) => ({ nombre, precioUsd: 24.9, fotoHref: FOTO, garantia: '6 meses', descripcion: 'Carga super rápida con cable incluido', conector: 'usb_c', marcas: ['Samsung'] }) as any;
const PROMO = { activa: true, precioPromoUsd: 19.9, unidades: 12, vigenciaISO: '2026-12-24' };
const ctx = (nombre = NOMBRES[1], extra: any = {}) => ({ producto: prod(nombre), tasaBs: 203.456, precio: 'bs' as const, ...extra });

test('version del motor 1.x y los 10 IDs de siempre, en el mismo orden', () => {
  assert.match(VERSION_MOTOR, /^[1-9]\d*\.\d+\.\d+$/);
  assert.deepEqual(IDS_PLANTILLAS, ['black-premium', 'pure-white', 'blue-signature', 'purple-edition', 'gradient-experience', 'product-spotlight', 'tech-editorial', 'modern-glass', 'dynamic-tech', 'luxury-minimal']);
});

// ── contrato 4:5 · borde a borde (R20) ──────────────────────────────────────────────────────────────────────
test('4:5 = 1080 × 1350 y el fondo de cada plantilla llena TODO el lienzo (nada de margenes ni bordes transparentes)', () => {
  for (const id of IDS_PLANTILLAS) for (const v of ['claro', 'oscuro'] as const) {
    const svg = renderSvg(id, ctx(NOMBRES[1], { variante: v }), '4x5');
    assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">'), id);
    assert.ok(/<\/defs><rect width="1080" height="1350" fill="url\(#fondo\)"\/>/.test(svg), `${id}: el primer elemento dibujado es el fondo de 1080 × 1350`);
  }
});

test('la franja inferior del pie translucido (R20) queda libre: todo el contenido por encima de ella, solo el pie centrado dentro', () => {
  const limite = 1350 - (PIE_BORDE_ALTO / PAGINA_BORDE.alto) * 1350;           // el pie del PDF mide 120 pt de 1012,5 pt -> 160 px de 1350
  assert.equal(limite, 1190); assert.equal(LIMITE_CONTENIDO_4X5, limite);
  for (const id of IDS_PLANTILLAS) {
    const l = layoutDe(PLANTILLAS[id], '4x5');
    const sobre = (y: number, que: string) => assert.ok(y <= limite, `${id}: ${que} llega a y=${y} (> ${limite})`);
    sobre(l.foto.y + l.foto.h, 'foto');
    sobre(l.garantia.y + l.garantia.h, 'garantia');
    sobre(l.precio.y + 24, 'precio (con su filete)');
    sobre(l.podio.cy + (PLANTILLAS[id].podio.tipo === 'ninguno' ? 0 : l.podio.alto + l.podio.ry), 'plataforma');
    if (l.lista.cantidad > 0) sobre(l.lista.modo === 'fila' ? l.lista.y + l.lista.icono + (l.lista.bloque ? 32 : 0) : l.lista.y + (l.lista.cantidad - 1) * l.lista.paso + l.lista.icono + (l.lista.bloque ? 32 : 0), 'lista');
    assert.deepEqual({ ...l.pie }, { x: 540, y: 1310, ancla: 'middle' }, `${id}: el pie va centrado en la franja`);
  }
});

test('nada pegado a los bordes: el contenido queda a >= 48 px de cada lado (zonas del layout y texto real, 4:5)', () => {
  for (const id of IDS_PLANTILLAS) {
    const d = dibujo(id, '4x5');
    for (const z of zonasProtegidas(d, false)) {
      if (z.nombre === 'pie' || z.nombre === 'precio') continue;                      // la zona del precio lleva 32 px de holgura a cada lado; su texto real se mide abajo
      assert.ok(z.caja.x >= 40 && z.caja.x + z.caja.w <= 1040 + 1, `${id}: zona «${z.nombre}» (${Math.round(z.caja.x)}..${Math.round(z.caja.x + z.caja.w)}) pegada al borde`);
    }
    const l = d.lay;
    assert.ok(l.foto.x >= 48 && l.foto.x + l.foto.w <= 1032, `${id}: foto (${l.foto.x}..${l.foto.x + l.foto.w})`);
    for (const nombre of NOMBRES) for (const promo of [undefined, PROMO]) for (const t of textosDe(renderSvg(id, ctx(nombre, { promo }), '4x5'))) {
      if (t.pie) continue;
      assert.ok(t.x0 >= 48 - 0.5 && t.x1 <= 1032 + 0.5, `${id}: «${t.txt.slice(0, 30)}» en ${Math.round(t.x0)}..${Math.round(t.x1)}`);
    }
  }
});

// ── ningun texto pisa a otro ───────────────────────────────────────────────────────────────────────────────────
type Txt = { txt: string; x0: number; x1: number; y0: number; y1: number; pie: boolean };
function textosDe(svg: string): Txt[] {
  const out: Txt[] = [];
  for (const m of svg.matchAll(/<text x="([\d.\-]+)" y="([\d.\-]+)" font-family="Jakarta-(\w+)" font-size="([\d.]+)"([^>]*)>(.*?)<\/text>/g)) {
    const [, xs, ys, fam, ts, resto, inner] = m, x = Number(xs), y = Number(ys), tam = Number(ts);
    const peso = fam === 'ExtraBold' ? 'extrabold' : fam === 'Bold' ? 'bold' : 'regular';
    const sp = Number(/letter-spacing="([\d.]+)"/.exec(resto)?.[1] ?? 0), anc = /text-anchor="(\w+)"/.exec(resto)?.[1] ?? 'start';
    const txt = inner.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const w = medir(txt, peso as any, tam, sp), x0 = anc === 'end' ? x - w : anc === 'middle' ? x - w / 2 : x;
    out.push({ txt, x0, x1: x0 + w, y0: y - tam * 0.72, y1: y + tam * 0.12, pie: /visionsmart\.app/.test(txt) });
  }
  return out;
}

test('ningun texto pisa a otro texto (titulo corto / normal / larguisimo, con y sin promocion, con etiqueta navidena larga) en las 10 plantillas × 3 formatos', () => {
  let casos = 0;
  for (const id of IDS_PLANTILLAS) for (const f of FORMS) for (const nombre of NOMBRES) for (const extra of [{}, { promo: PROMO }, { promo: PROMO, tema: { id: 'navidad', semilla: 'a', etiquetaPromo: 'PRECIO ESPECIAL DE NAVIDAD' } as TemaCtx }]) {
    const ts = textosDe(renderSvg(id, ctx(nombre, extra), f)); casos++;
    for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
      const a = ts[i], b = ts[j];
      const cruza = a.x0 < b.x1 - 0.5 && a.x1 > b.x0 + 0.5 && a.y0 < b.y1 - 0.5 && a.y1 > b.y0 + 0.5;
      assert.ok(!cruza, `${id} ${f} «${nombre.slice(0, 18)}» ${JSON.stringify(Object.keys(extra))}: «${a.txt.slice(0, 24)}» pisa a «${b.txt.slice(0, 24)}»`);
    }
  }
  assert.equal(casos, 10 * 3 * 3 * 3);
});

test('4:5: ningun texto entra en la franja del pie translucido salvo el pie centrado y la vigencia (que va justo encima del pie)', () => {
  for (const id of IDS_PLANTILLAS) for (const nombre of NOMBRES) for (const promo of [undefined, PROMO]) {
    for (const t of textosDe(renderSvg(id, ctx(nombre, { promo }), '4x5'))) {
      if (t.pie || /^OFERTA V/.test(t.txt)) continue;
      assert.ok(t.y1 <= 1190, `${id}: «${t.txt.slice(0, 30)}» llega a y=${Math.round(t.y1)}`);
    }
  }
});

// ── producto sin deformar + logo original ────────────────────────────────────────────────────────────────────
test('la foto del producto nunca se deforma (meet, centrada y apoyada abajo) y el logo es el PNG original (mismo SHA-256) en las 10 × 3 formatos', () => {
  const b64 = LOGO_SIMBOLO_HREF.replace(/^data:image\/png;base64,/, '');
  assert.equal(createHash('sha256').update(Buffer.from(b64, 'base64')).digest('hex'), LOGO_SIMBOLO_SHA256);
  assert.match(LOGO_SIMBOLO_SHA256, /^8e1639f5/);
  for (const id of IDS_PLANTILLAS) for (const f of FORMS) for (const v of ['claro', 'oscuro'] as const) {
    const svg = renderSvg(id, ctx(NOMBRES[1], { variante: v }), f);
    const fotos = [...svg.matchAll(/<image href="data:image\/png;base64,iVBORw0KGgo=" [^>]*\/>/g)].map((m) => m[0]);
    assert.ok(fotos.length >= 1 && fotos.length <= 2, `${id}: ${fotos.length} usos de la foto`);
    for (const t of fotos) assert.ok(/preserveAspectRatio="xMidYMax meet"/.test(t), `${id} ${f}: foto sin preserveAspectRatio meet: ${t}`);
    assert.equal(svg.split(LOGO_SIMBOLO_HREF).length - 1, 1, `${id} ${f}: el simbolo original aparece una vez`);
    assert.ok(!/preserveAspectRatio="none"|slice/.test(svg));
  }
});

test('el reflejo (solo PRODUCT SPOTLIGHT) es la misma foto volteada bajo su base, sin deformarla', () => {
  const svg = renderSvg('product-spotlight', ctx(), '4x5'), l = layoutDe(PLANTILLAS['product-spotlight'], '4x5');
  assert.ok(svg.includes(`<g transform="translate(0 ${2 * (l.foto.y + l.foto.h)}) scale(1 -1)"`));
  for (const id of IDS_PLANTILLAS) if (id !== 'product-spotlight') assert.ok(!renderSvg(id, ctx(), '4x5').includes('scale(1 -1)'), `${id} no lleva reflejo`);
});

// ── paleta corporativa ───────────────────────────────────────────────────────────────────────────────────────────
test('paleta: azul #1367A4, morado #9D3FCB, perla #F4F1EA y negro; jamas #1266A3', () => {
  const stops = (id: PlantillaId, v?: 'claro' | 'oscuro') => plantillaDe(id, v).fondo.paradas.map((p) => p[1].toUpperCase());
  assert.ok(stops('blue-signature').includes('#1367A4'));
  assert.deepEqual(stops('purple-edition'), ['#9D3FCB', '#9D3FCB']);
  assert.deepEqual([stops('gradient-experience')[0], stops('gradient-experience').at(-1)], ['#1367A4', '#9D3FCB']);
  for (const id of ['pure-white', 'tech-editorial', 'luxury-minimal'] as const) assert.deepEqual(stops(id), ['#F4F1EA', '#F4F1EA'], id);
  assert.deepEqual(stops('black-premium'), ['#000000', '#000000']);
  assert.deepEqual(stops('luxury-minimal', 'oscuro'), ['#000000', '#000000']);
  for (const id of IDS_PLANTILLAS) for (const f of FORMS) assert.ok(!/#1266A3/i.test(renderSvg(id, ctx(), f)), `${id} ${f}`);
});

// ── contraste (WCAG) de lo que debe leerse: texto, precio, etiqueta, precio anterior tachado y chip -X % ────────────────────
function lum(hex: string): number { const v = parseInt(hex.slice(1, 7), 16), c = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((x) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
const cr = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mezcla = (fg: string, bg: string, op: number) => { const f = parseInt(fg.slice(1, 7), 16), b = parseInt(bg.slice(1, 7), 16), m = (s: number) => Math.round(((f >> s) & 255) * op + ((b >> s) & 255) * (1 - op)); return '#' + [16, 8, 0].map((s) => m(s).toString(16).padStart(2, '0')).join(''); };

for (const [id, v] of [...IDS_PLANTILLAS.map((i) => [i, undefined] as const), ['luxury-minimal', 'oscuro'] as const]) {
  test(`contraste ${id}${v ? ' (' + v + ')' : ''}: texto, precio, etiqueta, tachado y chip legibles sobre los colores del fondo`, () => {
    const p = plantillaDe(id, v), fondos = p.fondo.paradas.map((x) => x[1]);
    for (const bg of fondos) {
      assert.ok(cr(p.texto, bg) >= 4.5, `texto ${p.texto} sobre ${bg}: ${cr(p.texto, bg).toFixed(2)}`);
      for (const c of p.precio.color) assert.ok(cr(c, bg) >= 4.5, `precio ${c} sobre ${bg}`);
      assert.ok(cr(p.precio.desde, bg) >= 4.5, `etiqueta ${p.precio.desde} sobre ${bg}: ${cr(p.precio.desde, bg).toFixed(2)}`);
      const tachado = esColorClaro(p.texto) ? '#FFFFFF' : p.texto;                       // lo que dibuja precio(): blanco en fondos oscuros, el color del texto en claros, al 94 %
      assert.ok(cr(mezcla(tachado, bg, 0.94), bg) >= 4.5, `precio anterior tachado sobre ${bg}: ${cr(mezcla(tachado, bg, 0.94), bg).toFixed(2)}`);
    }
    const chip = p.chip ?? { relleno: p.acento, texto: '#FFFFFF' };
    for (const r of chip.relleno) assert.ok(cr(chip.texto, r) >= 4.5, `chip -N %: ${chip.texto} sobre ${r}: ${cr(chip.texto, r).toFixed(2)}`);
    if (p.garantia.estilo !== 'borde') for (const r of (p.garantia.degradado ?? [p.garantia.relleno])) { assert.ok(cr(p.garantia.texto, r) >= 4.5, `garantia texto sobre ${r}`); assert.ok(cr(p.garantia.textoSec, r) >= 4.5, `garantia linea 1 sobre ${r}: ${cr(p.garantia.textoSec, r).toFixed(2)}`); }
    else for (const bg of fondos) assert.ok(cr(p.garantia.texto, bg) >= 4.5 && cr(p.garantia.textoSec, bg) >= 4.5, `garantia (borde) sobre ${bg}`);
  });
}

// ── LUXURY MINIMAL: perla o negro segun el producto ────────────────────────────────────────────────────────────────
test('LUXURY MINIMAL: fondo perla por defecto, negro si el producto es blanco; `variante` manda sobre la sugerencia; las otras 9 no cambian', () => {
  assert.equal(varianteSugerida({ nombre: 'Forro iPhone 15 negro' }), 'claro');
  assert.equal(varianteSugerida({ nombre: 'Forro iPhone 15 Blanco' }), 'oscuro');
  assert.equal(varianteSugerida({ nombre: 'Cargador White 20W' }), 'oscuro');
  assert.equal(varianteSugerida({ nombre: 'Audífonos color blanca perla' }), 'oscuro');
  assert.equal(varianteSugerida({ nombre: 'Cable USB-C 1 m' }), 'claro');
  assert.equal(varianteSugerida(null), 'claro');
  const claro = renderSvg('luxury-minimal', ctx('Cargador 20W'), '4x5'), oscuro = renderSvg('luxury-minimal', ctx('Cargador 20W', { variante: 'oscuro' }), '4x5');
  assert.ok(claro.includes('stop-color="#F4F1EA"') && !claro.includes('stop-color="#000000"/><stop offset="1" stop-color="#000000"'));
  assert.ok(oscuro.includes('<stop offset="0" stop-color="#000000"/><stop offset="1" stop-color="#000000"/>'));
  assert.equal(renderSvg('luxury-minimal', ctx('Cargador blanco 20W'), '4x5'), renderSvg('luxury-minimal', ctx('Cargador blanco 20W', { variante: 'oscuro' }), '4x5'), 'sugerida = oscuro');
  assert.equal(renderSvg('luxury-minimal', ctx('Cargador blanco 20W', { variante: 'claro' }), '4x5'), renderSvg('luxury-minimal', ctx('Cargador blanco 20W', { variante: 'claro' }), '4x5'));
  assert.notEqual(renderSvg('luxury-minimal', ctx('Cargador blanco 20W', { variante: 'claro' }), '4x5'), renderSvg('luxury-minimal', ctx('Cargador blanco 20W'), '4x5'), '`variante` manda sobre la sugerencia');
  for (const id of IDS_PLANTILLAS) if (id !== 'luxury-minimal') assert.equal(renderSvg(id, ctx('Cargador blanco 20W'), '4x5'), renderSvg(id, ctx('Cargador blanco 20W', { variante: 'oscuro' }), '4x5'), `${id}: ignora la variante`);
});

// ── Navidad sobre los 10 disenos nuevos ──────────────────────────────────────────────────────────────────────────────
function dibujo(id: PlantillaId, f: Formato, v?: 'claro' | 'oscuro'): Dibujo { const p = plantillaDe(id, v), { ancho, alto } = FORMATOS[f]; return { W: ancho, H: alto, p, lay: layoutDe(p, f), fu: FUENTE_JAKARTA, defs: [] }; }

test('Navidad en las 10 (y LUXURY en sus dos fondos): ningun adorno invade las zonas protegidas, la capa va SOBRE el diseno y se adapta al fondo', () => {
  for (const id of IDS_PLANTILLAS) for (const f of FORMS) for (const v of ['claro', 'oscuro'] as const) {
    if (id !== 'luxury-minimal' && v === 'oscuro') continue;
    const d = dibujo(id, f, v);
    for (const conPromo of [false, true]) {
      const zonas = zonasProtegidas(d, conPromo);
      for (const inten of INTENSIDADES) for (const semilla of ['a', 'b', 'c']) {
        const t: TemaCtx = { id: 'navidad', intensidad: inten, semilla, productoId: 7 };
        const capa = capaDeTema(d, t, id, conPromo)!;
        for (const c of capa.cajas) for (const z of zonas) assert.ok(!intersecta(c.caja, z.caja, 0) || (c.tipo === 'sombrero' && z.nombre === 'garantia'), `${id} ${f} ${v ?? ''} ${inten}: ${c.tipo} invade «${z.nombre}»`);
      }
      const svg = renderSvg(id, ctx(NOMBRES[1], { variante: v, promo: conPromo ? PROMO : undefined, tema: { id: 'navidad', semilla: 'a', productoId: 7 } }), f);
      const base = renderSvg(id, ctx(NOMBRES[1], { variante: v, promo: conPromo ? PROMO : undefined }), f);
      assert.ok(svg.length > base.length, 'el tema agrega decoracion');
      assert.ok(svg.endsWith('</g></svg>') || svg.endsWith('/></svg>') || svg.endsWith('</svg>'));
    }
  }
});

test('zonas protegidas: sin caracteristicas no hay zona de lista; el logo en pildora tiene su zona mas ancha; todas dentro del lienzo', () => {
  for (const id of IDS_PLANTILLAS) for (const f of FORMS) {
    const d = dibujo(id, f), z = zonasProtegidas(d, true), nombres = z.map((x) => x.nombre);
    assert.equal(nombres.includes('lista'), d.lay.lista.cantidad > 0, `${id} ${f}`);
    for (const x of z) assert.ok(x.caja.x >= 0 && x.caja.y >= 0 && x.caja.w > 0 && x.caja.h > 0, `${id} ${f} ${x.nombre}`);
    if (d.p.logo === 'pildora') { const lg = z.find((x) => x.nombre === 'logo')!; assert.ok(lg.caja.x <= d.lay.logo.x - 16 - 6 + 0.5, `${id}: la zona del logo cubre la pildora`); }
  }
});

// ── promocion: tachado + chip en las 10 ───────────────────────────────────────────────────────────────────────────────
test('promocion en las 10 × 3 formatos: precio promo, ANTES tachado, chip -17 %, unidades y vigencia presentes y dentro del lienzo', () => {
  for (const id of IDS_PLANTILLAS) for (const f of FORMS) {
    const svg = renderSvg(id, ctx(NOMBRES[1], { promo: { activa: true, precioPromoUsd: 20.7, unidades: 5, vigenciaISO: '2026-12-31' } }), f);
    assert.ok(svg.includes('ANTES Bs. 5.100') && svg.includes('Bs. 4.200'), `${id} ${f}`);
    assert.ok(svg.includes('-17%') && svg.includes('SOLO 5 UNIDADES') && svg.includes('OFERTA VÁLIDA HASTA EL 31/12/2026'));
    assert.ok(/<line [^>]*stroke-width="[3-9]"/.test(svg), 'tachado');
  }
});

// ── personalidad propia: no son el mismo diseno con otro color de fondo ─────────────────────────────────────────────────
test('las 10 disposiciones 4:5 son distintas entre si (>= 2 zonas en otro sitio) y cada una tiene sus propias capas decorativas', () => {
  const zonas = ['logo', 'titulo', 'lista', 'foto', 'precio', 'garantia'] as const;
  const L = Object.fromEntries(IDS_PLANTILLAS.map((i) => [i, layoutDe(PLANTILLAS[i], '4x5')])) as Record<PlantillaId, ReturnType<typeof layoutDe>>;
  for (let i = 0; i < IDS_PLANTILLAS.length; i++) for (let j = i + 1; j < IDS_PLANTILLAS.length; j++) {
    const a = IDS_PLANTILLAS[i], b = IDS_PLANTILLAS[j];
    const dif = zonas.filter((z) => { const p = (L[a] as any)[z], q = (L[b] as any)[z]; return Math.abs(p.x - q.x) > 40 || Math.abs(p.y - q.y) > 40 || Math.abs((p.w ?? p.ancho ?? 0) - (q.w ?? q.ancho ?? 0)) > 80 || (p.modo ?? '') !== (q.modo ?? '') || (p.ancla ?? '') !== (q.ancla ?? ''); }).length;
    assert.ok(dif >= 2, `${a} y ${b} se parecen demasiado: solo ${dif} zonas distintas`);
    assert.notEqual(JSON.stringify(PLANTILLAS[a].capas), JSON.stringify(PLANTILLAS[b].capas), `${a} y ${b} comparten capas`);
  }
  for (const id of IDS_PLANTILLAS) assert.ok((PLANTILLAS[id].capas ?? []).length >= 2, `${id}: capas decorativas propias`);
});

test('capas con `solo: 4x5` no aparecen en 1x1 ni 9x16; el SVG es determinista y solo usa etiquetas compatibles con react-native-svg', () => {
  const PERMITIDAS = new Set(['svg', 'defs', 'linearGradient', 'radialGradient', 'stop', 'rect', 'circle', 'ellipse', 'path', 'polygon', 'polyline', 'line', 'g', 'text', 'tspan', 'image']);
  for (const id of IDS_PLANTILLAS) for (const f of FORMS) {
    const svg = renderSvg(id, ctx(), f);
    assert.equal(svg, renderSvg(id, ctx(), f), 'determinista');
    for (const m of svg.matchAll(/<([A-Za-z][A-Za-z0-9]*)[\s>/]/g)) assert.ok(PERMITIDAS.has(m[1]), `${id}: etiqueta ${m[1]}`);
    assert.ok(!/filter|mask|clipPath|<pattern|<style|foreignObject/.test(svg));
  }
  assert.ok((renderSvg('luxury-minimal', ctx(), '4x5').match(/<polygon /g) ?? []).length > (renderSvg('luxury-minimal', ctx(), '9x16').match(/<polygon /g) ?? []).length, 'el marco fino de LUXURY solo existe en 4:5');
});
