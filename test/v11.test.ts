// v1.1.0: COLECCION 02 (plantillas 11-20). Pruebas con productos reales de distintos tipos (cargador, cable, audifonos, reloj inteligente, corneta, bateria portatil),
// con y sin promocion, con y sin tema Navidad, nombres cortos / normales / largos y los 3 formatos. La coleccion 01 se verifica en v10 y con las huellas de v07 / v08.
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSvg, IDS_PLANTILLAS, PLANTILLAS, layoutDe, medir, type Formato, type PlantillaId, type TemaCtx } from '../src/index.ts';

const NUEVAS = IDS_PLANTILLAS.slice(10) as PlantillaId[];
const FORMS = ['4x5', '1x1', '9x16'] as const;
const FOTO = 'data:image/png;base64,iVBORw0KGgo=';
const PRODUCTOS = [
  { nombre: 'Cargador Samsung 45W USB-C', categoria: 'Cargadores', tipoAccesorio: 'cargador', conector: 'usb_c', marcas: ['Samsung'], garantia: '6 meses', descripcion: 'Carga rápida con cable incluido' },
  { nombre: 'Cable USB-C a Lightning 1 m', categoria: 'Cables', conector: 'lightning', marcas: ['iPhone'], garantia: '3 meses', descripcion: 'Cable trenzado reforzado' },
  { nombre: 'Audifonos Bluetooth Inalambricos Premium con Cancelacion de Ruido y Estuche de Carga Rapida', categoria: 'Audifonos', marcas: ['Todas'], garantia: '1 año', descripcion: 'Bluetooth 5.3, hasta 24 horas de bateria' },
  { nombre: 'Reloj Inteligente Smartwatch Serie 9 Pantalla AMOLED', categoria: 'Relojes', garantia: 'Sin garantía', descripcion: '' },
  { nombre: 'Corneta JBL Go 3', categoria: 'Cornetas', marcas: ['JBL'], garantia: '15 días', descripcion: 'Resistente al agua IP67' },
  { nombre: 'Bateria Portatil Power Bank 20000 mAh', categoria: 'Power banks', conector: 'usb_c', garantia: '6 meses', descripcion: 'Carga rapida de 22.5 W' },
].map((p, i) => ({ ...p, precioUsd: [24.9, 6.5, 59.9, 89, 39.5, 31.25][i], fotoHref: i === 3 ? null : FOTO })) as any[];
const PROMO = { activa: true, precioPromoUsd: 4.9, unidades: 12, vigenciaISO: '2026-12-24' };
const PROMO2 = (p: any) => ({ activa: true, precioPromoUsd: Math.round(p.precioUsd * 0.8 * 100) / 100, unidades: 12, vigenciaISO: '2026-12-24' });
const TEMA: TemaCtx = { id: 'navidad', semilla: 'a', productoId: 3, etiquetaPromo: 'PRECIO ESPECIAL DE NAVIDAD' };

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
const DIM: Record<Formato, [number, number]> = { '4x5': [1080, 1350], '1x1': [1080, 1080], '9x16': [1080, 1920] };

test('coleccion 02: 6 tipos de producto × con / sin promocion × con / sin Navidad × 3 formatos: SVG valido, textos dentro del lienzo y ninguno pisa a otro', () => {
  const ETQ = new Set(['svg', 'defs', 'linearGradient', 'radialGradient', 'stop', 'rect', 'circle', 'ellipse', 'path', 'polygon', 'polyline', 'line', 'g', 'text', 'tspan', 'image']);
  let n = 0;
  for (const id of NUEVAS) for (const f of FORMS) for (const prod of PRODUCTOS) for (const modo of ['sin', 'promo', 'promo+nav', 'nav'] as const) {
    const ctx: any = { producto: prod, tasaBs: 203.456, precio: 'bs' };
    if (modo.startsWith('promo')) ctx.promo = modo === 'promo' ? PROMO2(prod) : { ...PROMO2(prod) };
    if (modo.endsWith('nav')) ctx.tema = { ...TEMA, productoId: 3 };
    const svg = renderSvg(id, ctx, f); n++;
    const [W, H] = DIM[f];
    assert.ok(svg.startsWith(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"`) && svg.endsWith('</svg>'));
    assert.ok(!/NaN|undefined|Infinity|\[object/.test(svg), `${id} ${f} ${modo}: valor invalido`);
    for (const m of svg.matchAll(/<([A-Za-z][A-Za-z0-9]*)[\s>/]/g)) assert.ok(ETQ.has(m[1]), `${id}: etiqueta ${m[1]}`);
    const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, `${id}: ids duplicados`);
    for (const m of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(m[1]), `${id}: degradado sin definir ${m[1]}`);
    assert.ok(svg.includes(prod.nombre.split(' ')[0].toUpperCase()) || svg.includes('…'), 'titulo');
    const ts = textosDe(svg);
    for (const t of ts) {
      assert.ok(t.x0 >= -0.5 && t.x1 <= W + 0.5 && t.y0 >= 0 && t.y1 <= H, `${id} ${f}: «${t.txt}» fuera del lienzo`);
      if (f === '4x5' && !t.pie && !/^OFERTA V/.test(t.txt)) assert.ok(t.x0 >= 47.5 && t.x1 <= 1032.5 && t.y1 <= 1190, `${id} 4x5 ${prod.nombre.slice(0, 14)} ${modo}: «${t.txt.slice(0, 26)}» en x ${Math.round(t.x0)}..${Math.round(t.x1)} y ${Math.round(t.y1)}`);
    }
    // ningun texto toca el recuadro de la garantia, salvo los de la propia garantia (que van dentro de el)
    if (prod.garantia !== 'Sin garantía') {
      const g = layoutDe(PLANTILLAS[id], f).garantia;
      for (const t of ts) { const dentro = t.x0 >= g.x - 1 && t.x1 <= g.x + g.w + 1 && t.y0 >= g.y - 1 && t.y1 <= g.y + g.h + 1; const cruza = t.x0 < g.x + g.w && t.x1 > g.x && t.y0 < g.y + g.h && t.y1 > g.y; assert.ok(dentro || !cruza, `${id} ${f} ${prod.nombre.slice(0, 14)} ${modo}: «${t.txt.slice(0, 24)}» toca el recuadro de la garantia`); }
    }
    for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
      const a = ts[i], b = ts[j];
      assert.ok(!(a.x0 < b.x1 - 0.5 && a.x1 > b.x0 + 0.5 && a.y0 < b.y1 - 0.5 && a.y1 > b.y0 + 0.5), `${id} ${f} ${prod.nombre.slice(0, 18)} ${modo}: «${a.txt.slice(0, 24)}» pisa a «${b.txt.slice(0, 24)}»`);
    }
  }
  assert.equal(n, 10 * 3 * 6 * 4);
});

test('nombres cortos, normales y largos en las 10 nuevas (con la etiqueta navidena larga y promocion) no se pisan', () => {
  for (const id of NUEVAS) for (const f of FORMS) for (const nombre of ['Cable USB', 'Cargador Samsung 45W USB-C', 'Audifonos Bluetooth Inalambricos Premium con Cancelacion de Ruido y Estuche de Carga Rapida', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA']) {
    const ts = textosDe(renderSvg(id, { producto: { ...PRODUCTOS[0], nombre }, tasaBs: 203.456, precio: 'bs', promo: PROMO2(PRODUCTOS[0]), tema: TEMA } as any, f));
    for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
      const a = ts[i], b = ts[j];
      assert.ok(!(a.x0 < b.x1 - 0.5 && a.x1 > b.x0 + 0.5 && a.y0 < b.y1 - 0.5 && a.y1 > b.y0 + 0.5), `${id} ${f} «${nombre.slice(0, 14)}»: «${a.txt.slice(0, 20)}» pisa a «${b.txt.slice(0, 20)}»`);
    }
  }
});

test('INFO BOX: solo caracteristicas reales del inventario (sin frases de relleno ni por categoria)', () => {
  const GENERICAS = /Alta\s*calidad|Dise[ñn]o\s*elegante|F[aá]cil\s*de\s*usar|Sonido|envolvente|Alta\s*dureza|Protecci[oó]n\s*total|Carga\s*y\s*datos|Energ[ií]a\s*donde|y\s*segura/i;
  for (const prod of PRODUCTOS) for (const f of FORMS) {
    const svg = renderSvg('info-box', { producto: prod, tasaBs: 203.456, precio: 'bs' } as any, f);
    assert.ok(!GENERICAS.test(svg), `${prod.nombre.slice(0, 20)} ${f}: frase de relleno en INFO BOX`);
  }
  const conector = renderSvg('info-box', { producto: PRODUCTOS[0], tasaBs: 203.456, precio: 'bs' } as any, '4x5');
  assert.ok(conector.includes('Conector') && conector.includes('USB-C') && conector.includes('SAMSUNG') && conector.includes('Carga r'), 'muestra conector, marca y potencia reales');
  const reloj = renderSvg('info-box', { producto: PRODUCTOS[3], tasaBs: 203.456, precio: 'bs' } as any, '4x5');
  assert.ok(!reloj.includes('Compatible') && !reloj.includes('Conector'), 'un producto sin esos datos no inventa nada');
  // las otras plantillas siguen completando con los textos de siempre
  assert.ok(/Alta|Dise|F[aá]cil/.test(renderSvg('clean-hex', { producto: PRODUCTOS[3], tasaBs: 203.456, precio: 'bs' } as any, '4x5')));
});

test('descripciones y numeracion de la coleccion 02: 11..20, una frase corta cada una', () => {
  NUEVAS.forEach((id, i) => { const p = PLANTILLAS[id]; assert.equal(p.numero, 11 + i); assert.equal(p.coleccion, 2); assert.ok(p.descripcion.length >= 10 && p.descripcion.length <= 70); });
});

test('las capas nuevas (onda, rejilla, hex, borde) son deterministas y no producen coordenadas invalidas', () => {
  for (const id of ['cosmic-flow', 'pearl-wave', 'black-grid', 'clean-hex', 'vision-frame'] as const) for (const f of FORMS) {
    const a = renderSvg(id, { producto: PRODUCTOS[0], tasaBs: 203.456, precio: 'bs' } as any, f);
    assert.equal(a, renderSvg(id, { producto: PRODUCTOS[0], tasaBs: 203.456, precio: 'bs' } as any, f));
    assert.ok(!/NaN|undefined|Infinity/.test(a));
  }
});
