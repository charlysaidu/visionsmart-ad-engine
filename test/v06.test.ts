// v0.6.0: el precio anterior TACHADO sale en las 10 plantillas x 3 formatos (Bs y USD), legible sobre su fondo y sin pisar precio, etiqueta ni vigencia.
import test from 'node:test';
import assert from 'node:assert/strict';
import { IDS_PLANTILLAS, renderSvg, VERSION_MOTOR } from '../src/index.ts';
import { PLANTILLAS } from '../src/plantillas.ts';
import { esColorClaro } from '../src/primitivas.ts';

const prod = { nombre: 'Cargador Samsung 45W USB-C', precioUsd: 15, fotoHref: null, garantia: '6 meses', marcas: ['Samsung'] } as any;
const FORMATOS = ['4x5', '1x1', '9x16'] as const;
const conAnterior = { activa: true, precioPromoUsd: 15, precioAnteriorUsd: 18, vigenciaISO: '2026-12-31' };
const sinAnterior = { activa: true, precioPromoUsd: 15, vigenciaISO: '2026-12-31' };                  // 15 = precio normal: el motor no inventa un anterior

type T = { texto: string; x: number; y: number; tam: number };
/** Elementos <text> con su baseline y tamano (suficiente para comprobar que no se pisan en vertical). */
function textos(svg: string): T[] {
  return [...svg.matchAll(/<text x="([\d.-]+)" y="([\d.-]+)"[^>]*? font-size="([\d.]+)"[^>]*>([^<]*)(?:<tspan[^>]*>[^<]*<\/tspan>)?<\/text>/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]), tam: Number(m[3]), texto: m[4] }));
}

test('version del motor >= 0.6.0', () => assert.match(VERSION_MOTOR, /^0\.[6-9]\.\d+/));

for (const id of IDS_PLANTILLAS) for (const f of FORMATOS) for (const modo of ['bs', 'usd'] as const) {
  test(`${id} ${f} ${modo}: precio anterior tachado, etiqueta OFERTA, precio y vigencia sin pisarse`, () => {
    const svg = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: modo, promo: conAnterior }, f);
    const ts = textos(svg);
    const ant = ts.find((t) => t.texto.startsWith('ANTES '));
    assert.ok(ant, 'texto ANTES <precio>');
    assert.ok(ant!.texto.includes(modo === 'usd' ? '$18.00' : 'Bs.'), 'el anterior va en la misma moneda');
    // tachado: una <line> horizontal que cubre el texto, con grosor visible, a la altura de ese texto
    const lineas = [...svg.matchAll(/<line x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)" stroke="(#[0-9A-Fa-f]{6})"[^>]*stroke-width="(\d+)"/g)];
    assert.equal(lineas.length, 1, 'una sola linea de tachado');
    const [, x1, y1, x2, y2, color, grosor] = lineas[0];
    assert.equal(y1, y2); assert.ok(Number(x2) - Number(x1) > ant!.tam * 3, 'la linea cubre el texto');
    assert.ok(Number(grosor) >= 3);
    assert.ok(Number(y1) < ant!.y && Number(y1) > ant!.y - ant!.tam, 'la linea cruza el texto');
    // contraste con el fondo: fondo oscuro -> tachado claro; fondo claro -> oscuro
    assert.equal(esColorClaro(color), esColorClaro(PLANTILLAS[id].texto), 'color del tachado acorde al fondo');
    // OFERTA arriba del anterior, y el anterior arriba del precio; nada se pisa
    const oferta = ts.find((t) => t.texto === 'OFERTA'); assert.ok(oferta, 'etiqueta OFERTA');
    const precio = ts.filter((t) => t.tam >= 60).sort((a, b) => b.tam - a.tam).find((t) => /\$|Bs\./.test(t.texto) && !t.texto.startsWith('ANTES'));
    assert.ok(precio, 'precio promo');
    // OFERTA: en la misma linea a la izquierda del anterior (sin tocarlo) o apilada encima\n    if (Math.abs(oferta!.y - ant!.y) < 1) assert.ok(ant!.x - oferta!.x >= oferta!.tam * 3.9, 'OFERTA a la izquierda del anterior sin tocarlo');\n    else assert.ok(oferta!.y + oferta!.tam * 0.25 < ant!.y - ant!.tam * 0.7, 'OFERTA encima del anterior');
    assert.ok(ant!.y + ant!.tam * 0.25 < precio!.y - precio!.tam * 0.7, 'el anterior no pisa al precio');
    // vigencia: debajo del precio y sin tocarlo
    const vig = ts.find((t) => t.texto.includes('VÁLIDA HASTA')); assert.ok(vig, 'vigencia');
    assert.ok(vig!.y - vig!.tam * 0.74 > precio!.y + 6, `la vigencia no pisa el precio (${vig!.y} vs ${precio!.y})`);
  });
}

for (const id of IDS_PLANTILLAS) for (const f of FORMATOS) {
  test(`${id} ${f}: sin precio anterior no aparece el bloque tachado`, () => {
    for (const promo of [sinAnterior, null, { activa: true }] as any[]) {
      const svg = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'usd', promo }, f);
      assert.ok(!svg.includes('ANTES') && !/<line /.test(svg), JSON.stringify(promo));
    }
    // y en modo Ninguno nunca hay precios, tampoco el anterior
    const no = renderSvg(id, { producto: prod, tasaBs: 163.33, precio: 'ninguno', promo: conAnterior }, f);
    assert.ok(!no.includes('ANTES') && !no.includes('$') && !no.includes('Bs.'));
  });
}