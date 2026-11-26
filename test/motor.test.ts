import test from 'node:test';
import assert from 'node:assert/strict';
import {
  renderSvg, FORMATOS, IDS_PLANTILLAS, PLANTILLAS, layoutDe, textoBolivares, textoDolares, redondearBs, miles, medir, tituloEnLineas, esc,
  textosPrecio, caracteristicasDe, garantiaDe, type ContextoAnuncio, type Formato, type PlantillaId,
} from '../src/index.ts';
import { renderSvgConFuentes } from '../src/con-fuentes.ts';
import { cssFuentesIncrustadas } from '../src/incrustadas.ts';

const FORMATOS_IDS = Object.keys(FORMATOS) as Formato[];
const FOTO = 'data:image/png;base64,iVBORw0KGgo=';
const ctx: ContextoAnuncio = {
  producto: { nombre: 'Cargador Samsung 45W USB-C', precioUsd: 24.9, fotoHref: FOTO, garantia: '6 meses', descripcion: 'Carga super rápida con cable incluido', conector: 'usb_c', marcas: ['Samsung'] },
  tasaBs: 203.456,
};

// Etiquetas SVG que react-native-svg interpreta bien (y Chromium tambien). Nada de filtros, foreignObject, style, script.
const TAGS_OK = new Set(['svg', 'defs', 'linearGradient', 'radialGradient', 'stop', 'rect', 'circle', 'ellipse', 'path', 'polygon', 'polyline', 'line', 'g', 'text', 'tspan', 'image']);

const etiquetas = (svg: string) => [...svg.matchAll(/<([A-Za-z][A-Za-z0-9]*)[\s>/]/g)].map((m) => m[1]);

test('hay exactamente 20 plantillas (colecciones 01 y 02), con los nombres del documento de referencia', () => {
  assert.equal(IDS_PLANTILLAS.length, 20);
  assert.deepEqual(IDS_PLANTILLAS.map((i) => PLANTILLAS[i].nombre), [
    'BLACK PREMIUM', 'PURE WHITE', 'BLUE SIGNATURE', 'PURPLE EDITION', 'GRADIENT EXPERIENCE',
    'PRODUCT SPOTLIGHT', 'TECH EDITORIAL', 'MODERN GLASS', 'DYNAMIC TECH', 'LUXURY MINIMAL',
    'NEON EDGE', 'CLEAN HEX', 'COSMIC FLOW', 'MINIMAL STRIPES', 'BLACK GRID', 'PEARL WAVE', 'DUAL TONE', 'INFO BOX', 'VISION FRAME', 'DIAGONAL SPLIT',
  ]);
  assert.equal(new Set(IDS_PLANTILLAS).size, 20);
  IDS_PLANTILLAS.forEach((id, i) => { assert.equal(PLANTILLAS[id].numero, i + 1); assert.equal(PLANTILLAS[id].coleccion, i < 10 ? 1 : 2); assert.ok(PLANTILLAS[id].descripcion.length >= 10 && PLANTILLAS[id].descripcion.length <= 70, id); });
});

for (const id of IDS_PLANTILLAS) {
  for (const f of FORMATOS_IDS) {
    test(`${id} · ${f}: SVG valido, dentro del lienzo y con todos los elementos`, () => {
      const svg = renderSvg(id, ctx, f);
      const { ancho: W, alto: H } = FORMATOS[f];
      assert.ok(svg.startsWith(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`) && svg.endsWith('</svg>'));
      // solo etiquetas compatibles; sin filtros, estilos ni emojis
      for (const t of etiquetas(svg)) assert.ok(TAGS_OK.has(t), `etiqueta no permitida: ${t}`);
      assert.ok(!/\p{Extended_Pictographic}/u.test(svg), 'emoji en la salida');
      assert.ok(!/NaN|undefined|Infinity|\[object/.test(svg), 'valor invalido en la salida');
      // etiquetas bien cerradas: cada <text> y <g> tiene su cierre
      for (const t of ['text', 'g', 'defs', 'tspan']) assert.equal((svg.match(new RegExp(`<${t}[\\s>]`, 'g')) ?? []).length, (svg.match(new RegExp(`</${t}>`, 'g')) ?? []).length, `${t} sin cerrar`);
      // ids de degradado unicos y todo url(#x) apunta a uno definido
      const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(new Set(ids).size, ids.length, 'ids duplicados');
      for (const m of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(m[1]), `degradado sin definir: ${m[1]}`);
      // contenido: marca, titulo, precio, garantia, pie, foto
      assert.ok(svg.includes('VISIONSMART'), 'logo');
      assert.ok(svg.includes('CARGADOR'), 'titulo');
      assert.ok(svg.includes('Bs. 5.100') && svg.includes('PRECIO'), 'precio');
      assert.ok(svg.includes('GARANTÍA') && svg.includes('6 MESES'), 'garantia');
      assert.ok(svg.includes('visionsmart.app') && svg.includes('@visionsmart.app'), 'pie');
      assert.equal((svg.match(/<image /g) ?? []).length, 2 + (PLANTILLAS[id].foto?.reflejo ? 1 : 0), 'foto + logo original (+ el reflejo de las plantillas que lo llevan)');
      assert.ok(svg.includes(FOTO));
      // todo texto con coordenadas dentro del lienzo
      for (const m of svg.matchAll(/<text x="([\d.\-]+)" y="([\d.\-]+)"/g)) {
        assert.ok(Number(m[1]) >= 0 && Number(m[1]) <= W, `x fuera: ${m[1]}`);
        assert.ok(Number(m[2]) > 0 && Number(m[2]) <= H, `y fuera: ${m[2]}`);
      }
    });
  }

  test(`${id}: zonas del layout dentro del lienzo en los 3 formatos`, () => {
    for (const f of FORMATOS_IDS) {
      const { ancho: W, alto: H } = FORMATOS[f];
      const l = layoutDe(PLANTILLAS[id], f);
      const dentro = (x: number, y: number, w: number, h: number, que: string) => assert.ok(x >= 0 && y >= 0 && x + w <= W && y + h <= H, `${id} ${f} ${que} fuera del lienzo`);
      dentro(l.foto.x, l.foto.y, l.foto.w, l.foto.h, 'foto');
      dentro(l.garantia.x, l.garantia.y, l.garantia.w, l.garantia.h, 'garantia');
      dentro(l.podio.cx - l.podio.rx, l.podio.cy - l.podio.ry, l.podio.rx * 2, l.podio.ry * 2 + l.podio.alto, 'podio');
      assert.ok(l.pie.y < H && l.precio.y < H);
      // la lista no pisa el precio ni el pie: queda por encima del precio o, en las disposiciones que la ponen debajo (PURE WHITE) o al lado (MODERN GLASS), no se cruzan sus cajas
      if (l.lista.cantidad > 0) {
        const filas = l.lista.modo === 'rejilla' ? Math.ceil(l.lista.cantidad / 2) : l.lista.cantidad;
        const li = l.lista.modo === 'fila' ? { x: l.lista.x, y: l.lista.y, w: l.lista.ancho, h: l.lista.icono } : { x: l.lista.x, y: l.lista.y, w: l.lista.ancho, h: (filas - 1) * (l.lista.pasoY ?? l.lista.paso) + l.lista.icono };
        const pr = { x: l.precio.ancla === 'end' ? l.precio.x - l.precio.ancho : l.precio.ancla === 'middle' ? l.precio.x - l.precio.ancho / 2 : l.precio.x, y: l.precio.y - l.precio.tam * 1.05, w: l.precio.ancho, h: l.precio.tam * 1.05 + 10 };
        const cruza = li.x < pr.x + pr.w && li.x + li.w > pr.x && li.y < pr.y + pr.h && li.y + li.h > pr.y;
        assert.ok(!cruza, `${id} ${f}: la lista pisa el precio`);
        assert.ok(li.y + li.h < l.pie.y - 20, `${id} ${f}: la lista llega al pie`);
      }
    }
  });
}

test('precio Bs moderado: ~65-70 % del tamano del spike (150 px) en 4x5 y es lo mas grande de la franja inferior', () => {
  const svg = renderSvg('black-premium', ctx, '4x5');
  const tam = Number(/font-size="(\d+)"[^>]*fill="url\(#precioG\)"/.exec(svg)![1]);
  assert.ok(tam >= 95 && tam <= 105, `tam Bs = ${tam}`);
  const tamEtiqueta = Number(/font-size="(\d+)"[^>]*>PRECIO</.exec(svg)![1]);
  assert.ok(tam > tamEtiqueta * 2.5);
});

test('modos de precio: solo bs / usd / ninguno (aplica igual a una plantilla individual y a un lote)', () => {
  assert.ok(!('ambos' in { bs: 1, usd: 1, ninguno: 1 }));
  for (const id of IDS_PLANTILLAS) {
    const bs = renderSvg(id, { ...ctx, precio: 'bs' }, '4x5');
    assert.ok(bs.includes('Bs. 5.100') && !bs.includes('$24.90'));
    const usd = renderSvg(id, { ...ctx, precio: 'usd' }, '4x5');
    assert.ok(usd.includes('$24.90') && !usd.includes('Bs.'));
    const ninguno = renderSvg(id, { ...ctx, precio: 'ninguno' }, '4x5');
    assert.ok(!ninguno.includes('Bs.') && !ninguno.includes('$24') && !ninguno.includes('PRECIO'));
    assert.ok(ninguno.includes('6 MESES'), 'la garantia sigue');
    assert.equal(renderSvg(id, ctx, '4x5'), bs, 'por defecto = bs');
  }
});

test('sin tasa: modo bs no inventa precio; usd no necesita tasa; ninguno siempre null', () => {
  assert.equal(textosPrecio('bs', 24.9, null), null);
  assert.equal(textosPrecio('bs', 24.9, 203.456), 'Bs. 5.100');
  assert.equal(textosPrecio('usd', 24.9, null), '$24.90');
  assert.equal(textosPrecio('usd', null, 200), null);
  assert.equal(textosPrecio('ninguno', 24.9, 203.456), null);
  assert.ok(!renderSvg('pure-white', { ...ctx, tasaBs: null }, '4x5').includes('Bs.'));
});

test('reglas de precio de App Cliente: Bs al multiplo de 100 con puntos de miles; USD con 2 decimales', () => {
  assert.equal(redondearBs(2034.56), 2000); assert.equal(redondearBs(2050), 2100);
  assert.equal(miles(20300), '20.300'); assert.equal(miles(1234567), '1.234.567'); assert.equal(miles(950), '950');
  assert.equal(textoBolivares(24.9, 203.456), 'Bs. 5.100'); assert.equal(textoBolivares(100, 203.456), 'Bs. 20.300');
  assert.equal(textoDolares(24.9), '$24.90'); assert.equal(textoDolares(5), '$5.00');
  for (const t of [null, 0, -1, NaN]) assert.equal(textoBolivares(10, t as any), null);
  assert.equal(textoBolivares(null, 200), null); assert.equal(textoDolares(0), null);
});

test('metricas reales de Plus Jakarta Sans', () => {
  assert.ok(Math.abs(medir('A', 'regular', 100) - 65.2) < 0.1);
  assert.ok(medir('MMM', 'extrabold', 100) > medir('iii', 'extrabold', 100) * 2);
  assert.ok(medir('Hola', 'bold', 50, 4) > medir('Hola', 'bold', 50));
  assert.ok(medir('ñÁé€', 'regular', 40) > 0);                       // acentos y simbolos con medida propia
});

test('titulo: usa la menor cantidad de lineas razonable, hasta 3, y solo recorta en casos extremos', () => {
  assert.equal(tituloEnLineas('Cable USB', 540, 92, 50).lineas.length, 1);
  const dos = tituloEnLineas('Audifonos inalambricos pro', 540, 92, 50);
  assert.ok(dos.lineas.length >= 2 && dos.lineas.length <= 3);
  const tres = tituloEnLineas('Cargador Samsung 45W USB-C', 540, 92, 50);
  assert.equal(tres.lineas.length, 3); assert.ok(!tres.lineas.join('').includes('...'));
  for (const l of tres.lineas) assert.ok(medir(l, 'extrabold', tres.tam) <= 540 + 1);
  const absurdo = tituloEnLineas('X'.repeat(200), 540, 92, 50);
  assert.ok(absurdo.lineas[0].endsWith('...') && absurdo.lineas.length === 1);
  assert.deepEqual(tituloEnLineas('   ', 540, 92, 50).lineas, ['']);
});

test('nombres largos, raros o con simbolos no rompen ninguna plantilla ni formato', () => {
  const nombres = ['Soporte para celular de auto con carga inalámbrica magnética 15W + cable', 'A', 'Ñandú & Co <Pro> "Max" 100%', 'ÁÉÍÓÚ ÜÑ ¡¿?!', '12345678901234567890'];
  for (const nombre of nombres) for (const id of IDS_PLANTILLAS) for (const f of FORMATOS_IDS) {
    const svg = renderSvg(id, { ...ctx, producto: { ...ctx.producto, nombre } }, f);
    assert.ok(!/NaN|undefined/.test(svg));
    assert.ok((svg.match(/font-size="(\d+(\.\d+)?)"/g) ?? []).every((s) => Number(/"([\d.]+)"/.exec(s)![1]) >= 10));
    assert.ok(!svg.includes('<Pro>') && !svg.includes('"Max"'), 'texto sin escapar');
  }
});

test('sin foto: no hay <image> de producto, aparece el simbolo de marca tenue; sin tasa ni garantia se omiten esos bloques', () => {
  const svg = renderSvg('black-premium', { producto: { nombre: 'Funda', precioUsd: 5, garantia: 'Sin garantía' }, tasaBs: null }, '4x5');
  assert.ok(!svg.includes(FOTO), 'sin imagen de producto');
  assert.equal((svg.match(/<image /g) ?? []).length, 2, 'logo del encabezado + simbolo tenue');
  assert.ok(svg.includes('opacity="0.22"'));
  assert.ok(!svg.includes('GARANTÍA') && !svg.includes('MESES'));
});

test('caracteristicas y garantia: datos reales, sin promesas falsas', () => {
  const c = caracteristicasDe(ctx.producto, 4);
  assert.equal(c.length, 4);
  assert.ok(c.some((x) => x.lineas.join(' ').includes('USB-C')) && c.some((x) => x.lineas.join(' ').includes('45 W')) && c.some((x) => x.lineas.join(' ').includes('SAMSUNG')));
  const generico = caracteristicasDe({ nombre: 'Algo', precioUsd: 1 }, 3);
  assert.equal(generico.length, 3);
  assert.deepEqual(garantiaDe('3 meses'), { tiene: true, linea1: 'GARANTÍA', linea2: '3 MESES' });
  assert.equal(garantiaDe('1 año').linea2, '1 AÑO'); assert.equal(garantiaDe('15 días').linea2, '15 DÍAS');
  assert.equal(garantiaDe('Sin garantía').tiene, false); assert.equal(garantiaDe(null).tiene, false);
});

test('pie = logo + visionsmart.app + @visionsmart.app y nada mas (sin WhatsApp, delivery ni envios)', () => {
  for (const id of IDS_PLANTILLAS) assert.ok(!/whatsapp|delivery|env[ií]os/i.test(renderSvg(id, ctx, '4x5')));
  assert.ok(renderSvg('black-premium', { ...ctx, marca: { web: 'otra.ve', redes: '@otra' } }, '4x5').includes('otra.ve'));
});

test('determinista: mismo contexto -> mismo SVG; ids y formatos desconocidos lanzan error claro', () => {
  for (const id of IDS_PLANTILLAS) assert.equal(renderSvg(id, ctx, '9x16'), renderSvg(id, ctx, '9x16'));
  assert.throws(() => renderSvg('nada' as PlantillaId, ctx, '4x5'), /Plantilla desconocida/);
  assert.throws(() => renderSvg('black-premium', ctx, '2x3' as Formato), /Formato desconocido/);
});

test('fuentes incrustadas: las 3 TTF van como @font-face base64 SOLO en la variante de PC; el nucleo queda limpio', () => {
  const css = cssFuentesIncrustadas();
  for (const fam of ['Jakarta-Regular', 'Jakarta-Bold', 'Jakarta-ExtraBold']) assert.ok(css.includes(`font-family:'${fam}'`));
  assert.equal((css.match(/@font-face/g) ?? []).length, 3);
  assert.equal((css.match(/data:font\/ttf;base64,/g) ?? []).length, 3);
  assert.ok(/AAEAAA|T1RUTw/.test(css) || css.includes('base64,AAE'));   // firma de TTF (0x00010000) en base64
  const base = renderSvg('black-premium', ctx, '4x5');
  assert.ok(!base.includes('@font-face') && !base.includes('<style'));
  const conFuentes = renderSvgConFuentes('black-premium', ctx, '4x5');
  assert.ok(conFuentes.includes('@font-face'));
  assert.equal(conFuentes.replace(css, ''), base, 'solo difiere por el bloque <style>');
  assert.ok(conFuentes.indexOf('<style>') < conFuentes.indexOf('<defs>'));
});

test('el nucleo no usa APIs de plataforma (Intl, toLocaleString, DOM)', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const archivos = (dir: string): string[] => readdirSync(new URL(`../src/${dir}`, import.meta.url), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? archivos(`${dir}${e.name}/`) : [`${dir}${e.name}`]));
  for (const f of archivos('')) {
    if (f === 'incrustadas.ts' || f === 'metricas.ts') continue;
    const src = readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.ok(!/\bIntl\b|toLocaleString\(|document\.|window\.|require\(|process\./.test(src), `${f} usa una API de plataforma`);
  }
});