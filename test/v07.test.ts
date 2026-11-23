// v0.7.0: sistema de TEMAS VISUALES (capa decorativa sobre las 10 plantillas) + tema Navidad.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { IDS_PLANTILLAS, renderSvg, VERSION_MOTOR, FORMATOS, layoutDe, PLANTILLAS, INTENSIDADES, TEMAS, IDS_TEMAS, ETIQUETAS_PROMO_NAVIDAD, zonasProtegidas, capaDeTema, intersecta, type Formato, type TemaCtx } from '../src/index.ts';
import type { Dibujo } from '../src/primitivas.ts';
import { FUENTE_JAKARTA } from '../src/tipos.ts';

const prod = { nombre: 'Cargador Samsung 25W USB tipo C/C carga rápida', precioUsd: 12.85, fotoHref: 'data:image/png;base64,iVBORw0KGgo=', garantia: '3 meses', conector: 'usb_c', tipoAccesorio: 'cargador', categoria: 'Cargadores', marcas: ['samsung'], descripcion: 'Cargador Samsung de 25W' } as any;
const FORMS = ['4x5', '1x1', '9x16'] as const;
const dibujo = (id: any, f: Formato): Dibujo => { const p = PLANTILLAS[id], { ancho, alto } = FORMATOS[f]; return { W: ancho, H: alto, p, lay: layoutDe(p, f), fu: FUENTE_JAKARTA, defs: [] }; };
const PROMO = { activa: true, precioPromoUsd: 12.85, precioAnteriorUsd: 15, unidades: 8, vigenciaISO: '2026-12-31' };

test('version 0.7.0 y registro de temas', () => {
  assert.equal(VERSION_MOTOR, '0.7.0');
  assert.deepEqual(IDS_TEMAS, ['navidad']); assert.equal(TEMAS.navidad.nombre, 'Navidad VisionSmart');
});

// ── regresion CERO: sin tema la salida es byte-identica a la de v0.6.0 (huellas sha256 capturadas antes de tocar el motor) ──
test('sin tema (ausente o null) la salida es BYTE-IDENTICA a v0.6.0 en 10 plantillas × 3 formatos × 5 casos', () => {
  const g = JSON.parse(readFileSync(new URL('./golden/0.6.0.json', import.meta.url), 'utf8')); assert.equal(g.version, '0.6.0');
  const casos: Record<string, any> = {
    usd: { precio: 'usd' }, bs: { precio: 'bs' }, ninguno: { precio: 'ninguno' },
    promo: { precio: 'usd', promo: PROMO }, promoBs: { precio: 'bs', promo: { activa: true, precioPromoUsd: 10, vigenciaISO: '2026-12-31' } },
  };
  let n = 0;
  for (const id of IDS_PLANTILLAS) for (const f of FORMS) for (const [k, c] of Object.entries(casos)) {
    const esperado = g.casos[`${id}|${f}|${k}`]; assert.ok(esperado, `${id}|${f}|${k}`);
    for (const tema of [undefined, null]) {
      const svg = renderSvg(id, { producto: prod, tasaBs: 163.33, ...c, ...(tema === null ? { tema: null } : {}) }, f);
      assert.equal(createHash('sha256').update(svg).digest('hex'), esperado, `${id}|${f}|${k}|tema=${tema}`); n++;
    }
  }
  assert.equal(n, 300);
});

const ETQ_OK = new Set(['svg', 'defs', 'linearGradient', 'radialGradient', 'stop', 'rect', 'circle', 'ellipse', 'path', 'polygon', 'polyline', 'line', 'g', 'text', 'tspan', 'image']);
function validarSvg(svg: string) {
  assert.ok(svg.startsWith('<svg ') && svg.endsWith('</svg>'));
  assert.ok(!/NaN|undefined|Infinity/.test(svg), 'sin NaN / undefined');
  const pila: string[] = [];
  for (const m of svg.matchAll(/<(\/?)([A-Za-z]+)([^>]*?)(\/?)>/g)) {
    if (!ETQ_OK.has(m[2])) assert.fail('etiqueta no permitida en el SVG: ' + m[2]);
    if (m[4] === '/') continue; if (m[1]) assert.equal(pila.pop(), m[2]); else pila.push(m[2]);
  }
  assert.equal(pila.length, 0, 'etiquetas sin cerrar');
  const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  for (const m of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(m[1]), 'degradado sin definir ' + m[1]);
  assert.ok(!/filter=|<filter|<style|@font-face|<script/.test(svg), 'sin filtros / estilos / fuentes');
}

const tema = (extra: Partial<TemaCtx> = {}): TemaCtx => ({ id: 'navidad', productoId: 349, semilla: 'a', ...extra });

for (const id of IDS_PLANTILLAS) for (const f of FORMS) {
  test(`${id} ${f}: 3 intensidades × con/sin promoción = SVG válido, decoración presente y sin tocar zonas protegidas`, () => {
    const d = dibujo(id, f);
    for (const inten of INTENSIDADES) for (const conPromo of [false, true]) {
      const ctx = { producto: prod, tasaBs: 163.33, precio: 'usd' as const, ...(conPromo ? { promo: PROMO } : {}) };
      const svg = renderSvg(id, { ...ctx, tema: tema({ intensidad: inten }) }, f); validarSvg(svg);
      const base = renderSvg(id, ctx, f);
      assert.ok(svg.length > base.length, 'el tema agrega decoracion');
      // el SVG de la plantilla queda intacto: la capa es un sufijo antes de </svg> (salvo la etiqueta de oferta cuando hay promocion)
      if (!conPromo) assert.ok(svg.startsWith(base.slice(0, base.length - '</svg>'.length)), 'la plantilla no se modifica');
      // zonas protegidas, calculadas aparte con el mismo layout: ninguna caja decorativa las cruza (margen 0 = ni se tocan)
      const zonas = zonasProtegidas(d, conPromo);
      for (const semilla of ['a', 'b', 'c', 'd']) {
        const capa = capaDeTema(d, tema({ intensidad: inten, semilla }), id, conPromo)!;
        for (const c of capa.cajas) {
          assert.ok(c.caja.x >= 0 && c.caja.y >= 0 && c.caja.x + c.caja.w <= d.W && c.caja.y + c.caja.h <= d.H, `${c.tipo} dentro del lienzo`);
          // el sombrero de Santa puede sentarse sobre el borde superior de la garantia (max. 8 px dentro de ella, nunca sobre su texto)
          for (const z of zonas) { const caja = c.tipo === 'sombrero' && z.nombre === 'garantia' ? { x: z.caja.x + 4, y: z.caja.y + 4 + 8, w: z.caja.w - 8, h: z.caja.h - 16 } : z.caja; assert.ok(!intersecta(c.caja, caja, c.tipo === 'sombrero' && z.nombre === 'garantia' ? 0 : 2), `${id} ${f} ${inten} ${semilla}: ${c.tipo} invade «${z.nombre}»`); }
        }
        const grandes = capa.cajas.filter((c) => c.tipo !== 'nieve');
        const tope = { sutil: 3, equilibrada: 5, festiva: 8 }[inten]; assert.ok(grandes.length <= tope, `${inten}: ${grandes.length} elementos > ${tope}`);
      }
    }
  });
}

test('cantidad de elementos por intensidad (promedio sobre 10 plantillas × 3 formatos × 4 semillas)', () => {
  const prom: Record<string, number> = {};
  for (const inten of INTENSIDADES) {
    let total = 0, m = 0;
    for (const id of IDS_PLANTILLAS) for (const f of FORMS) for (const semilla of ['a', 'b', 'c', 'd']) { total += capaDeTema(dibujo(id, f), tema({ intensidad: inten, semilla }), id, false)!.cajas.filter((c) => c.tipo !== 'nieve').length; m++; }
    prom[inten] = total / m;
  }
  console.log('promedio de elementos grandes:', JSON.stringify(prom));
  assert.ok(prom.sutil >= 1.5 && prom.sutil <= 3, 'sutil ' + prom.sutil);
  assert.ok(prom.equilibrada >= 3 && prom.equilibrada <= 5, 'equilibrada ' + prom.equilibrada);
  assert.ok(prom.festiva >= 4.5 && prom.festiva <= 8, 'festiva ' + prom.festiva);
  assert.ok(prom.sutil < prom.equilibrada && prom.equilibrada < prom.festiva);
});

test('semilla: la misma da EXACTAMENTE lo mismo; otra semilla, otra variacion; producto y plantilla también entran', () => {
  const ctx = { producto: prod, tasaBs: 163.33, precio: 'usd' as const };
  const a1 = renderSvg('black-premium', { ...ctx, tema: tema({ semilla: 's1' }) }, '4x5'), a2 = renderSvg('black-premium', { ...ctx, tema: tema({ semilla: 's1' }) }, '4x5');
  assert.equal(a1, a2);
  assert.notEqual(a1, renderSvg('black-premium', { ...ctx, tema: tema({ semilla: 's2' }) }, '4x5'));
  assert.notEqual(a1, renderSvg('black-premium', { ...ctx, tema: tema({ semilla: 's1', productoId: 350 }) }, '4x5'));
  assert.notEqual(renderSvg('pure-white', { ...ctx, tema: tema({ semilla: 's1' }) }, '4x5').slice(-400), a1.slice(-400));
  assert.equal(renderSvg('black-premium', { ...ctx, tema: tema({ semilla: 7 }) }, '4x5'), renderSvg('black-premium', { ...ctx, tema: tema({ semilla: 7 }) }, '4x5'));
});

test('elementos: apagar un elemento lo quita (nieve, regalos, luces, árboles, calcetines...)', () => {
  const d = dibujo('black-premium', '4x5');
  const tipos = (el: any, semilla: string) => new Set(capaDeTema(d, tema({ intensidad: 'festiva', semilla, elementos: el }), 'black-premium', false)!.cajas.map((c) => c.tipo));
  const vistos = new Set<string>(); for (const s of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) for (const t of tipos({}, s)) vistos.add(t);
  for (const t of ['nieve', 'regalo', 'pino', 'luces', 'monte', 'destello']) assert.ok(vistos.has(t), 'con todo activo aparece ' + t);
  const apagar: [string, string][] = [['nieve', 'nieve'], ['regalos', 'regalo'], ['luces', 'luces'], ['arboles', 'arbol'], ['calcetines', 'calcetin'], ['pino', 'pino'], ['montes', 'monte'], ['destellos', 'destello'], ['sombreros', 'sombrero'], ['munecos', 'muneco']];
  for (const [flag, tipo] of apagar) for (const s of ['a', 'b', 'c', 'd', 'e', 'f']) assert.ok(!tipos({ [flag]: false }, s).has(tipo), `${flag}=false no debe dibujar ${tipo}`);
  assert.equal(capaDeTema(d, tema({ elementos: { nieve: false, regalos: false, pino: false, luces: false, arboles: false, calcetines: false, sombreros: false, munecos: false, montes: false, destellos: false } }), 'black-premium', false)!.cajas.length, 0);
});

test('etiquetas navideñas SOLO con promoción: reemplazan «OFERTA» y no tocan precios ni cálculos', () => {
  for (const id of IDS_PLANTILLAS) for (const f of FORMS) {
    const sinPromo = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'usd', tema: tema() }, f);
    for (const e of ETIQUETAS_PROMO_NAVIDAD) assert.ok(!sinPromo.includes(e), 'sin promoción no hay etiqueta navideña');
    assert.ok(sinPromo.includes('>PRECIO<'));
    const conPromo = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'usd', promo: PROMO, tema: tema() }, f);
    assert.equal(ETIQUETAS_PROMO_NAVIDAD.filter((e) => conPromo.includes(`>${e}<`)).length, 1, `${id} ${f}: una etiqueta navideña`);
    assert.ok(!conPromo.includes('>OFERTA<'));
    for (const txt of ['$12.85', 'ANTES $15.00', '-14%', 'SOLO 8 UNIDADES', 'OFERTA VÁLIDA HASTA EL 31/12/2026']) assert.ok(conPromo.includes(txt), `${id} ${f}: conserva ${txt}`);
    const sinEtq = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'usd', promo: PROMO, tema: tema({ elementos: { etiquetas: false } }) }, f); assert.ok(sinEtq.includes('>OFERTA<'));
    const fija = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'usd', promo: PROMO, tema: tema({ etiquetaPromo: 'Regala tecnología' }) }, f); assert.ok(fija.includes('>REGALA TECNOLOGÍA<'));
    const ning = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'ninguno', promo: PROMO, tema: tema() }, f); assert.ok(!ETIQUETAS_PROMO_NAVIDAD.some((e) => ning.includes(e)), 'sin precio no hay etiqueta');
  }
  const todas = new Set<string>(); for (let i = 0; i < 40; i++) { const s = renderSvg('black-premium', { producto: prod, tasaBs: 163.33, precio: 'usd', promo: PROMO, tema: tema({ productoId: i }) }, '4x5'); for (const e of ETIQUETAS_PROMO_NAVIDAD) if (s.includes(`>${e}<`)) todas.add(e); }
  assert.equal(todas.size, 4, 'las 4 etiquetas se usan');
});

test('etiqueta larga cabe en el ancho del precio (se achica sola)', async () => {
  const { medir } = await import('../src/util.ts');
  for (const id of IDS_PLANTILLAS) for (const f of FORMS) {
    const svg = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'usd', promo: PROMO, tema: tema({ etiquetaPromo: 'PRECIO ESPECIAL DE NAVIDAD' }) }, f);
    const m = /<text [^>]*font-size="(\d+)" letter-spacing="3"[^>]*>PRECIO ESPECIAL DE NAVIDAD</.exec(svg); assert.ok(m, `${id} ${f}`);
    assert.ok(medir('PRECIO ESPECIAL DE NAVIDAD', 'bold', Number(m![1]), 3) <= layoutDe(PLANTILLAS[id], f).precio.ancho + 1, `${id} ${f} cabe`);
  }
});

test('el tema no cambia datos ni precios: mismos textos de la plantilla con y sin tema', () => {
  const textos = (s: string) => [...s.matchAll(/>([^<>]{1,60})<\/(?:text|tspan)>/g)].map((m) => m[1]).filter((t) => !ETIQUETAS_PROMO_NAVIDAD.includes(t as any) && t !== 'OFERTA');
  for (const id of IDS_PLANTILLAS) for (const f of FORMS) {
    const base = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'bs', promo: PROMO }, f), con = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'bs', promo: PROMO, tema: tema({ intensidad: 'festiva' }) }, f);
    assert.deepEqual(textos(con), textos(base), `${id} ${f}`);
    assert.ok(con.includes(base.match(/<image href="[^"]+"/)![0]), 'la foto del producto se conserva');
  }
});

test('tema desconocido o sin id: no dibuja nada y no rompe', () => {
  const base = renderSvg('black-premium', { producto: prod, tasaBs: 163.33, precio: 'usd' }, '4x5');
  assert.equal(renderSvg('black-premium', { producto: prod, tasaBs: 163.33, precio: 'usd', tema: { id: 'no-existe' } as any }, '4x5'), base);
  assert.equal(renderSvg('black-premium', { producto: prod, tasaBs: 163.33, precio: 'usd', tema: {} as any }, '4x5'), base);
});