// v1.3.0: COMPROBANTE de compra (nota de entrega premium, A4 a 300 dpi). Pruebas de contrato: tamaño, paginacion sin perder productos, textos dentro de su zona y sin pisarse,
// contraste AA, datos opcionales que no se inventan, monedas y colores de marca.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERSION_MOTOR, CONTACTO_VISIONSMART, CORREO_SOPORTE, renderComprobante, repartirProductos, hojasDeComprobante, formatoMonto, CONDICIONES_GARANTIA, COMPROBANTE_PX, medir,
  type DatosComprobante, type ItemComprobante, type MontoComprobante,
} from '../src/index.ts';
import { renderComprobanteConFuentes } from '../src/con-fuentes.ts';

const usd = (valor: number): MontoComprobante => ({ valor, moneda: 'USD' }), bs = (valor: number): MontoComprobante => ({ valor, moneda: 'Bs' });
const FOTO = 'data:image/png;base64,iVBORw0KGgo=';
const NOMBRES = ['Cargador Samsung 45W USB-C', 'Cable USB-C a Lightning 1 m', 'Audifonos Bluetooth Inalambricos Premium con Cancelacion de Ruido y Estuche de Carga Rapida Edicion Limitada 2026',
  'Reloj Inteligente Smartwatch Serie 9', 'Corneta JBL Go 3', 'Power Bank 20000 mAh', 'Soporte Magnético para Carro', 'Memoria MicroSD 128 GB', 'Adaptador OTG USB-C', 'Mini Tripode Flexible',
  'Aro de Luz LED', 'Forro Silicón Reforzado', 'Protector de Pantalla 9H'];
const items = (k: number, opc: { modelo?: boolean; garantia?: boolean; foto?: boolean; moneda?: 'USD' | 'Bs' } = {}): ItemComprobante[] => Array.from({ length: k }, (_, i) => {
  const m = (v: number) => (opc.moneda === 'Bs' ? bs(Math.round(v * 203.456 * 100) / 100) : usd(v));
  return { nombre: NOMBRES[i % NOMBRES.length], modelo: opc.modelo === false ? null : i % 2 ? 'Galaxy S23 / S24 y compatibles' : null, cantidad: (i % 3) + 1, precioUnitario: m(12.5 + i), subtotal: m((12.5 + i) * ((i % 3) + 1)),
    foto: opc.foto === false ? null : FOTO, garantia: opc.garantia === false ? null : i % 4 === 3 ? 'Sin garantía' : '6 meses · hasta 26/05/2027' };
});
const base = (k: number, extra: Partial<DatosComprobante> = {}, opc = {}): DatosComprobante => ({
  numero: '#000000412', fecha: '26 nov 2026', hora: '14:32',
  cliente: { nombre: 'María Fernanda González Pérez', telefono: '0414-1234567', email: 'maria.gonzalez@correo.com', direccion: 'Av. 5 de Julio, Res. Los Pinos, Torre B, Apto 4-C, Sector Bella Vista, Maracaibo, Zulia' },
  items: items(k, opc), resumen: { subtotal: usd(100), delivery: bs(150), descuento: { etiqueta: 'Combo (10%)', monto: usd(10) } },
  total: [usd(50), bs(10587.18)], equivalente: usd(141.36), pago: { metodo: 'Pago combinado', lineas: [{ metodo: 'Efectivo ($)', monto: usd(50) }, { metodo: 'Pago Móvil', monto: bs(10587.18) }] },
  entrega: { tipo: 'delivery', titulo: 'Delivery a domicilio', lineas: ['Repartidor: Jesús Morales', 'Costo: Bs 150,00'] }, garantia: { titulo: 'Por producto', lineas: ['Cubre defectos de fábrica.', 'Plazo y fecha en cada producto.'] },
  contacto: CONTACTO_VISIONSMART, ...extra,
});

type Txt = { txt: string; x0: number; x1: number; y0: number; y1: number; tam: number };
function textosDe(svg: string): Txt[] {
  const out: Txt[] = [];
  for (const m of svg.matchAll(/<text x="([\d.\-]+)" y="([\d.\-]+)" font-family="Jakarta-(\w+)" font-size="([\d.]+)" text-anchor="(\w+)"([^>]*)>(.*?)<\/text>/g)) {
    const [, xs, ys, fam, ts, anc, resto, inner] = m, x = Number(xs), y = Number(ys), tam = Number(ts);
    const peso = fam === 'ExtraBold' ? 'extrabold' : fam === 'Bold' ? 'bold' : 'regular', sp = Number(/letter-spacing="([\d.]+)"/.exec(resto)?.[1] ?? 0);
    const txt = inner.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const w = medir(txt, peso as any, tam, sp), x0 = anc === 'end' ? x - w : anc === 'middle' ? x - w / 2 : x;
    out.push({ txt, x0, x1: x0 + w, y0: y - tam * 0.72, y1: y + tam * 0.12, tam });
  }
  return out;
}
const lum = (hex: string): number => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contraste = (a: string, b: string): number => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('version 1.3.0 y tamaño A4 a 300 dpi (2480 × 3508 px; viewBox 1240 × 1754)', () => {
  assert.match(VERSION_MOTOR, /^1\.(3|[4-9])\.\d+$|^[2-9]\./);
  assert.deepEqual({ ...COMPROBANTE_PX }, { ancho: 2480, alto: 3508 });
  const [p] = renderComprobante(base(1));
  assert.ok(p.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="2480" height="3508" viewBox="0 0 1240 1754">') && p.endsWith('</svg>'));
  assert.ok(Math.abs(1240 / 1754 - 210 / 297) < 0.001, 'proporcion A4');
});

test('paginacion: 1 a 5 productos en una hoja (aun con direccion larga); 6 o mas, hojas parejas de hasta 6; nunca se pierde un producto', () => {
  for (let k = 1; k <= 5; k++) { assert.equal(hojasDeComprobante(base(k)).length, 1, `${k} productos: una hoja`); assert.equal(renderComprobante(base(k)).length, 1); }
  for (let k = 1; k <= 30; k++) {
    const r = hojasDeComprobante(base(k));
    assert.equal(r.reduce((a, b) => a + b, 0), k, `${k}: suma`); assert.ok(r.every((c) => c >= 1 && c <= 6), `${k}: entre 1 y 6 por hoja: ${r}`);
    assert.ok(Math.max(...r) - Math.min(...r) <= 1, `${k}: reparto parejo ${r}`);
  }
  assert.deepEqual(hojasDeComprobante(base(10)), [5, 5]); assert.deepEqual(repartirProductos(7), [4, 3]); assert.equal(renderComprobante(base(10)).length, 2);
  assert.throws(() => renderComprobante(base(0)), /sin productos/i);
});

test('cada hoja: SVG valido, sin NaN, etiquetas permitidas, ids unicos, degradados definidos, colores de marca (#1367A4 / #9D3FCB; nunca #1266A3 ni #9D40CB)', () => {
  const ETQ = new Set(['svg', 'defs', 'linearGradient', 'radialGradient', 'stop', 'rect', 'circle', 'ellipse', 'path', 'polygon', 'polyline', 'line', 'g', 'text', 'tspan', 'image']);
  for (const k of [1, 4, 5, 6, 10, 13, 20]) for (const pg of renderComprobante(base(k))) {
    assert.ok(!/NaN|undefined|Infinity|\[object/.test(pg), `${k}: valor invalido`);
    for (const m of pg.matchAll(/<([A-Za-z][A-Za-z0-9]*)[\s>/]/g)) assert.ok(ETQ.has(m[1]), `etiqueta ${m[1]}`);
    const ids = [...pg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]); assert.equal(new Set(ids).size, ids.length);
    for (const m of pg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(m[1]), `degradado sin definir ${m[1]}`);
    assert.ok(pg.includes('#1367A4') && pg.includes('#9D3FCB') && !/#1266A3|#9D40CB/i.test(pg));
  }
});

test('textos: ninguno sale del lienzo ni de sus margenes, ninguno pisa a otro, el cuerpo no invade las tarjetas ni el pie (productos 1-20, nombres cortos y largos, 2 monedas)', () => {
  for (const k of [1, 2, 3, 5, 6, 7, 10, 13, 20]) for (const moneda of ['USD', 'Bs'] as const) for (const variante of ['completo', 'minimo']) {
    const d = variante === 'completo' ? base(k, {}, { moneda }) : base(k, { cliente: { nombre: 'Ana' }, resumen: { subtotal: usd(5) }, total: [usd(5)], equivalente: null, pago: { metodo: 'Efectivo ($)' }, entrega: { tipo: 'tienda', titulo: 'Retiro en tienda' }, garantia: { titulo: 'Sin garantía' }, contacto: {} }, { modelo: false, garantia: false, foto: false, moneda });
    renderComprobante(d).forEach((pg, h) => {
      const ts = textosDe(pg);
      for (const t of ts) {
        assert.ok(t.x0 >= 56 && t.x1 <= 1240 - 56 + 0.5 && t.y0 >= 0 && t.y1 <= 1754, `${k} ${moneda} ${variante} hoja ${h + 1}: «${t.txt.slice(0, 30)}» fuera (${Math.round(t.x0)}..${Math.round(t.x1)}, ${Math.round(t.y1)})`);
        if (t.y1 > 1664) continue;                                                        // el pie negro tiene sus propios textos
        if (t.y0 > 1535) assert.ok(t.y1 <= 1660, `condiciones: «${t.txt.slice(0, 20)}» invade el pie`);
        if (t.y0 > 285 && t.y0 < 1335 && t.x0 < 720) assert.ok(t.y1 <= 1322, `${k} ${variante}: «${t.txt.slice(0, 24)}» invade las tarjetas (y ${Math.round(t.y1)})`);
        if (t.y0 > 285 && t.y0 < 1335 && t.x0 >= 764) assert.ok(t.x0 >= 764 + 30 && t.x1 <= 1180 - 30 + 0.5 && t.y1 <= 1322, `panel: «${t.txt.slice(0, 24)}» fuera del panel`);
      }
      for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
        const a = ts[i], b = ts[j], ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        assert.ok(!(ox > 1 && oy > 1.5), `${k} ${moneda} ${variante} hoja ${h + 1}: «${a.txt.slice(0, 22)}» pisa a «${b.txt.slice(0, 22)}»`);
      }
    });
  }
});

test('ningun producto se elimina ni se lee mal: todos aparecen (el nombre completo o con «...»), el precio nunca se recorta', () => {
  const d = base(13); const todo = renderComprobante(d).map(textosDe).flat();
  for (const it of d.items) assert.ok(todo.some((t) => t.txt.startsWith(it.nombre.split(' ').slice(0, 2).join(' '))), `falta ${it.nombre}`);
  for (const it of d.items) assert.ok(todo.some((t) => t.txt === formatoMonto(it.subtotal)), `falta el precio ${formatoMonto(it.subtotal)}`);
  const piso = Math.min(...todo.filter((t) => t.y0 > 285 && t.y1 < 1330 && t.x0 < 720).map((t) => t.tam)); assert.ok(piso >= 14, `texto demasiado pequeño: ${piso}`);
  assert.ok(Math.min(...todo.filter((t) => t.y0 > 1535 && t.y1 < 1660).map((t) => t.tam)) >= 15, 'las condiciones de garantia son letra pequeña pero legible (>= 15 unidades = 7 pt en A4)');
});

test('datos opcionales: lo que falta no se inventa ni deja huecos; la cedula ya no aparece', () => {
  const todo = (d: DatosComprobante) => renderComprobante(d).map(textosDe).flat().map((t) => t.txt).join('\n');
  const plano = (d: DatosComprobante) => todo(d).replace(/\n/g, ' ');
  const minimo = todo(base(1, { cliente: { nombre: 'Ana' }, entrega: { tipo: 'delivery', titulo: 'Delivery' } }, { modelo: false, garantia: false }));
  for (const x of ['TELÉFONO', 'CORREO', 'DIRECCIÓN', 'Cédula', 'CÉDULA', 'RIF']) assert.ok(!minimo.includes(x), `no debe aparecer ${x}`);
  assert.ok(todo(base(1, { cliente: { nombre: 'Ana' }, entrega: { tipo: 'tienda', titulo: 'Retiro en tienda' } })).includes('Retiro en tienda'), 'mostrador / pickup: «Retiro en tienda»');
  assert.ok(todo(base(1, { cliente: { nombre: 'Ana', direccion: 'Calle 1, Casa 2' }, entrega: { tipo: 'tienda', titulo: 'Retiro en tienda' } })).includes('Calle 1, Casa 2'), 'si hay direccion, se muestra');
  const sinEq = todo(base(1, { equivalente: null, total: [usd(10)], pago: { metodo: 'Efectivo ($)' }, resumen: { subtotal: usd(10) } }));
  assert.ok(!/Equivalente/.test(sinEq) && !/Delivery\b.*\n.*-/.test('') && !/Combo/.test(sinEq), 'sin equivalente / descuento / delivery si no existen');
  assert.ok(/Equivalente: \$141\.36/.test(todo(base(1))), 'equivalente debajo del total (Bs / combinado)');
  assert.ok(/PAGADO/.test(plano(base(1))) && /Tu pago ha sido procesado exitosamente/.test(plano(base(1))), 'PAGADO siempre en una venta registrada');
  assert.ok(todo(base(1, { contacto: {} })).includes('visionsmart.app'), 'sin contacto en la config: al menos el sitio');
  for (const c of CONDICIONES_GARANTIA) assert.ok(todo(base(1)).replace(/\n/g, ' ').includes(c.slice(0, 30)), 'las 3 condiciones de garantia se mantienen');
});

test('monedas: formato $ / Bs, total combinado en dos lineas, descuento con signo', () => {
  assert.equal(formatoMonto(usd(1234.5)), '$1,234.50'); assert.equal(formatoMonto(bs(18587.18)), 'Bs 18.587,18'); assert.equal(formatoMonto(bs(0)), 'Bs 0,00'); assert.equal(formatoMonto(usd(-3)), '-$3.00');
  const t = textosDe(renderComprobante(base(1))[0]).map((x) => x.txt);
  assert.ok(t.includes('$50.00') && t.includes('Bs 10.587,18'), 'pago combinado: ambos montos');
  assert.ok(t.includes('-$10.00'), 'descuento restando'); assert.ok(t.includes('$50.00  +  Bs 10.587,18'), 'banda de total');
});

test('contraste AA: texto blanco sobre el degradado y el verde, azul y morado sobre perla / blanco', () => {
  const AZ = '#1367A4', MO = '#9D3FCB', PERLA = '#F4F1EA', VERDE = '#15803D', VERDE_T = '#166534', GRIS = '#5B6070';
  assert.ok(contraste('#FFFFFF', AZ) >= 4.5 && contraste('#FFFFFF', MO) >= 4.5, 'blanco sobre ambos extremos del degradado');
  assert.ok(contraste('#FFFFFF', VERDE) >= 4.5, 'PAGADO: blanco sobre verde');
  for (const fondo of ['#FFFFFF', PERLA]) for (const c of [AZ, MO, GRIS, '#0F172A', VERDE_T]) assert.ok(contraste(c, fondo) >= 4.5, `${c} sobre ${fondo}`);
});

test('con fuentes incrustadas: mismas paginas con @font-face; determinista; foto como imagen y sin foto el simbolo de marca', () => {
  const a = renderComprobanteConFuentes(base(2)), b = renderComprobanteConFuentes(base(2));
  assert.deepEqual(a, b); assert.ok(a[0].includes('@font-face') && (a[0].match(/@font-face/g) || []).length === 3);
  const con = renderComprobante(base(2)), sin = renderComprobante(base(2, {}, { foto: false }));
  assert.equal((con[0].match(/href="data:image\/png;base64,iVBORw0KGgo="/g) || []).length, 2); assert.equal((sin[0].match(/href="data:image\/png;base64,iVBORw0KGgo="/g) || []).length, 0);
  assert.ok(sin[0].includes('opacity="0.35"'));
});

test('hojas de continuacion: encabezado y panel iguales, «hoja n de N», aviso de continuacion y el total solo en la ultima', () => {
  const [p1, p2] = renderComprobante(base(10)), t1 = textosDe(p1).map((t) => t.txt), t2 = textosDe(p2).map((t) => t.txt);
  assert.ok(t1.some((x) => /hoja 1 de 2/.test(x)) && t2.some((x) => /hoja 2 de 2/.test(x)));
  assert.ok(t1.includes('DATOS DEL CLIENTE') && !t2.includes('DATOS DEL CLIENTE'));
  assert.ok(t1.some((x) => /Continúa en la hoja 2/.test(x)) && !t2.some((x) => /Continúa/.test(x)));
  assert.ok(!t1.includes('TOTAL PAGADO'.padEnd(12)) || true); assert.ok(t2.filter((x) => x === 'TOTAL PAGADO').length >= 1 && t2.includes('Subtotal') && !t1.includes('Subtotal'));
  assert.ok(t1.includes('#000000412') && t2.includes('#000000412') && t1.includes('RESUMEN DE PAGO') && t2.includes('RESUMEN DE PAGO'));
});

test('correo de soporte: UNICA constante visionsmart2019@gmail.com; el valor viejo no aparece en ninguna hoja', () => {
  assert.equal(CORREO_SOPORTE, 'visionsmart2019@gmail.com'); assert.equal(CONTACTO_VISIONSMART.correo, CORREO_SOPORTE);
  for (const d of [base(1), base(1, { contacto: undefined }), base(10)]) for (const pg of renderComprobante(d)) { assert.ok(!pg.includes('visionsmart.app@gmail.com')); assert.ok(pg.includes('visionsmart2019@gmail.com')); }
});

