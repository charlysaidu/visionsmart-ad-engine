import type { Plantilla, PlantillaId } from './tipos.ts';
import type { DatosProducto } from './datos.ts';

// Las 10 plantillas del motor 1.0.0 como CONFIGURACION (JSON puro): paleta, tratamientos y CAPAS decorativas propias.
// La disposicion 4:5 de cada una vive en layouts.ts, y el dibujo en primitivas.ts / capas.ts.
// Paleta corporativa: azul #1367A4, morado #9D3FCB, blanco perla #F4F1EA, negro #000000 (+ tonos claros de los dos primeros para luces sobre fondos oscuros).
const AZUL = '#1367A4', MORADO = '#9D3FCB', PERLA = '#F4F1EA';
const AZUL_CL = '#3FA0E8', MORADO_CL = '#C072E8';          // versiones luminosas para trazos y luces sobre negro

export const PLANTILLAS: Record<PlantillaId, Plantilla> = {
  // 01 · tecnologia premium sobre negro absoluto: iluminacion ambiental azul y morada, producto grande, boton de degradado
  'black-premium': {
    id: 'black-premium', nombre: 'BLACK PREMIUM', familia: 'clasico',
    fondo: { angulo: 90, paradas: [[0, '#000000'], [1, '#000000']] },
    texto: '#F4F1EA', textoSec: '#A7ADBD',
    acento: [AZUL_CL, MORADO_CL],
    titulo: { ancla: 'start' },
    icono: { estilo: 'circulo', color: '#F4F1EA', relleno: 'rgba(255,255,255,0.05)', borde: 'rgba(120,175,235,0.85)' },
    precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#C7CCDA' },
    garantia: { estilo: 'boton', borde: '#FFFFFF', relleno: AZUL, texto: '#FFFFFF', textoSec: '#F6F8FD', degradado: [AZUL, MORADO] },
    chip: { relleno: [AZUL, MORADO], texto: '#FFFFFF' },
    podio: { tipo: 'disco', tapa: ['#16181F', '#07080B'], cuerpo: ['#0E1015', '#000000'], borde: '#2A7BC8', brillo: '#3F8EE0', bordeDegradado: [AZUL_CL, MORADO_CL] },
    adornos: [],
    capas: [
      { t: 'luz', ref: 'foto', x: 0.15, y: 0.5, rx: 0.95, ry: 0.85, color: '#1E7BDB', op: 0.55 },
      { t: 'luz', ref: 'foto', x: 0.92, y: 0.3, rx: 0.75, ry: 0.7, color: MORADO, op: 0.5 },
      { t: 'marco', ref: 'lienzo', color: [AZUL_CL, MORADO_CL], op: 0.55, inset: 30, largo: 56, grosor: 2.5 },
      { t: 'linea', x1: 0.58, y1: 0.11, x2: 1.02, y2: 0.255, color: [AZUL_CL, MORADO_CL], op: 0.5, grosor: 2 },
      { t: 'linea', x1: -0.02, y1: 0.93, x2: 0.4, y2: 0.885, color: [MORADO_CL, AZUL_CL], op: 0.35, grosor: 1.5 },
    ],
    logo: 'claro', pie: '#7F8596',
  },

  // 02 · minimalismo limpio: blanco perla, mucho espacio negativo, detalles pequenos en azul y morado
  'pure-white': {
    id: 'pure-white', nombre: 'PURE WHITE', familia: 'centrado',
    fondo: { angulo: 90, paradas: [[0, PERLA], [1, PERLA]] },
    texto: '#0A0A0F', textoSec: '#5B5F6E',
    acento: ['#0A0A0F', '#0A0A0F'],
    titulo: { ancla: 'start' },
    icono: { estilo: 'linea', color: AZUL, relleno: 'none', borde: 'none' },
    precio: { color: ['#0A0A0F', '#0A0A0F'], desde: '#5F6372', acento: [AZUL, MORADO] },
    garantia: { estilo: 'borde', borde: AZUL, relleno: 'rgba(19,103,164,0.05)', texto: '#0A0A0F', textoSec: AZUL },
    podio: { tipo: 'ninguno', tapa: ['#FFFFFF', '#EFEBE2'], cuerpo: ['#E7E2D8', '#CFC9BC'], borde: '#FFFFFF', brillo: '#FFFFFF', sombra: '#5A5A66' },
    adornos: [],
    capas: [
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.78, ry: 0.7, color: '#FFFFFF', op: 0.95 },
      { t: 'aro', ref: 'foto', x: 0.93, y: 0.2, r: 0.045, color: [MORADO], op: 0.55, grosor: 2 },
      { t: 'aro', ref: 'foto', x: 0.05, y: 0.7, r: 0.03, color: [AZUL], op: 0.5, grosor: 2 },
      { t: 'puntos', x: 0.07, y: 0.255, cols: 4, filas: 3, paso: 22, color: AZUL, op: 0.5, r: 2.2 },
      { t: 'puntos', x: 0.86, y: 0.5, cols: 3, filas: 3, paso: 22, color: MORADO, op: 0.45, r: 2.2 },
    ],
    chip: { relleno: [AZUL, MORADO], texto: '#FFFFFF' },
    logo: 'oscuro', pie: '#8A8D98',
  },

  // 03 · identidad azul tecnologica: fondo azul corporativo, luz azul alrededor del producto, formas geometricas, detalles morados
  'blue-signature': {
    id: 'blue-signature', nombre: 'BLUE SIGNATURE', familia: 'clasico',
    fondo: { angulo: 70, paradas: [[0, '#1670AE'], [0.55, AZUL], [1, '#0E5287']] },
    texto: '#FFFFFF', textoSec: '#D6E8F7',
    acento: ['#FFFFFF', '#EBD3F8'],
    titulo: { ancla: 'start' },
    icono: { estilo: 'circulo', color: '#FFFFFF', relleno: 'rgba(255,255,255,0.12)', borde: 'rgba(255,255,255,0.75)' },
    precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#EAF3FB' },
    garantia: { estilo: 'relleno', borde: '#FFFFFF', relleno: MORADO, texto: '#FFFFFF', textoSec: '#FFFFFF' },
    podio: { tipo: 'disco', tapa: ['#2B8AD0', '#1367A4'], cuerpo: ['#0F5A91', '#0A3F68'], borde: '#8FCBF2', brillo: '#6CC0F5' },
    adornos: [],
    capas: [
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.95, ry: 0.8, color: '#58B4F0', op: 0.6 },
      { t: 'poli', pts: [[0.58, 0], [1, 0], [1, 0.3]], relleno: '#FFFFFF', op: 0.06 },
      { t: 'poli', pts: [[0, 0.62], [0.3, 1], [0, 1]], relleno: '#FFFFFF', op: 0.05 },
      { t: 'aro', ref: 'foto', x: 0.5, y: 0.52, r: 0.5, ry: 0.5, color: ['#FFFFFF'], op: 0.22, grosor: 2 },
      { t: 'aro', ref: 'foto', x: 0.5, y: 0.52, r: 0.64, ry: 0.64, color: ['#FFFFFF'], op: 0.12, grosor: 2 },
      { solo: '4x5', t: 'poli', pts: [[0.635, 0.348], [0.64, 0.348], [0.64, 0.62], [0.635, 0.62]], relleno: MORADO, op: 1 },
      { solo: '4x5', t: 'puntos', x: 0.72, y: 0.105, cols: 4, filas: 2, paso: 20, color: '#D8A6F2', op: 0.85, r: 2.4 },
    ],
    chip: { relleno: [MORADO, MORADO], texto: '#FFFFFF' },
    logo: 'pildora', pie: '#BBD6EE',
  },

  // 04 · elegancia morada: fondo #9D3FCB, plataforma para el producto, detalles azules discretos, minimalista
  'purple-edition': {
    id: 'purple-edition', nombre: 'PURPLE EDITION', familia: 'centrado',
    fondo: { angulo: 90, paradas: [[0, MORADO], [1, MORADO]] },
    texto: '#FFFFFF', textoSec: '#F3E6FB',
    acento: ['#FFFFFF', '#FFFFFF'],
    titulo: { ancla: 'start' },
    icono: { estilo: 'circulo', color: '#FFFFFF', relleno: 'rgba(255,255,255,0.12)', borde: 'rgba(255,255,255,0.75)' },
    precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#FBF4FE' },
    garantia: { estilo: 'relleno', borde: '#FFFFFF', relleno: '#FFFFFF', texto: '#6B2A8E', textoSec: '#6B2A8E' },
    podio: { tipo: 'disco', tapa: ['#B561DE', '#8F33BD'], cuerpo: ['#7E2AA8', '#561A78'], borde: '#E7C8FA', brillo: '#E3A8F7', bordeDegradado: ['#7CC4F5', '#F1D8FC'] },
    adornos: [],
    capas: [
      { t: 'disco', ref: 'lienzo', x: 0.5, y: 0.5, r: 0.95, color: '#35094F', op: 0, opBorde: 0.6 },
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.85, ry: 0.7, color: '#D58EF0', op: 0.55 },
      { t: 'luz', ref: 'lienzo', x: 0.08, y: 0.92, rx: 0.45, color: AZUL, op: 0.5 },
      { t: 'aro', ref: 'foto', x: 0.5, y: 0.52, r: 0.5, ry: 0.36, color: ['#FFFFFF'], op: 0.14, grosor: 2 },
      { t: 'puntos', x: 0.065, y: 0.05, cols: 4, filas: 2, paso: 20, color: '#8FD0FA', op: 0.75, r: 2.4 },
      { t: 'aro', ref: 'lienzo', x: 0.93, y: 0.06, r: 0.018, color: ['#8FD0FA'], op: 0.85, grosor: 3 },
    ],
    chip: { relleno: ['#FFFFFF', '#FFFFFF'], texto: '#6B2A8E' },
    logo: 'pildora', pie: '#EBD5F8',
  },

  // 05 · protagonismo del degradado oficial azul -> morado, formas de luz y profundidad
  'gradient-experience': {
    id: 'gradient-experience', nombre: 'GRADIENT EXPERIENCE', familia: 'centrado',
    fondo: { angulo: 55, paradas: [[0, AZUL], [1, MORADO]] },
    texto: '#FFFFFF', textoSec: '#F0E8FA',
    acento: ['#FFFFFF', '#FFFFFF'],
    titulo: { ancla: 'start' },
    icono: { estilo: 'circulo', color: '#FFFFFF', relleno: 'rgba(255,255,255,0.14)', borde: 'rgba(255,255,255,0.8)' },
    precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#FBF4FE' },
    garantia: { estilo: 'relleno', borde: '#FFFFFF', relleno: '#FFFFFF', texto: '#4A2478', textoSec: '#4A2478' },
    podio: { tipo: 'ninguno', tapa: ['#FFFFFF', '#FFFFFF'], cuerpo: ['#FFFFFF', '#FFFFFF'], borde: '#FFFFFF', brillo: '#FFFFFF', sombra: '#3A1466' },
    adornos: [],
    capas: [
      { t: 'disco', ref: 'lienzo', x: 0.78, y: 0.2, r: 0.55, color: '#FFFFFF', op: 0.2 },
      { t: 'disco', ref: 'lienzo', x: 0.15, y: 0.78, r: 0.5, color: '#F0C4FF', op: 0.24 },
      { t: 'banda', x: 0.5, y: 0.42, largo: 1700, grosor: 150, angulo: -24, color: ['#FFFFFF'], op: 0.08 },
      { t: 'aro', ref: 'foto', x: 0.5, y: 0.5, r: 0.62, ry: 0.5, color: ['#FFFFFF'], op: 0.26, grosor: 2 },
      { t: 'aro', ref: 'foto', x: 0.5, y: 0.5, r: 0.8, ry: 0.66, color: ['#FFFFFF'], op: 0.13, grosor: 2 },
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.6, rx: 0.8, ry: 0.7, color: '#FFFFFF', op: 0.36 },
      { t: 'poli', pts: [[0, 0.69], [1, 0.66], [1, 0.868], [0, 0.868]], relleno: '#FFFFFF', op: 0.1 },
    ],
    foto: { sombra: 'estudio' },
    chip: { relleno: ['#FFFFFF', '#FFFFFF'], texto: '#4A2478' },
    logo: 'pildora', pie: '#EADFF8',
  },

  // 06 · fotografia publicitaria: negro, el producto lo es todo, luz de estudio, reflejo y plataforma luminosa
  'product-spotlight': {
    id: 'product-spotlight', nombre: 'PRODUCT SPOTLIGHT', familia: 'centrado',
    fondo: { angulo: 90, paradas: [[0, '#02030A'], [0.55, '#05091A'], [1, '#010207']] },
    texto: '#FFFFFF', textoSec: '#A9B6D2',
    acento: ['#FFFFFF', '#C9DDFF'],
    titulo: { ancla: 'start' },
    icono: { estilo: 'circulo', color: '#FFFFFF', relleno: 'rgba(255,255,255,0.05)', borde: 'rgba(255,255,255,0.8)' },
    precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#C9D4E8' },
    garantia: { estilo: 'borde', borde: 'rgba(255,255,255,0.75)', relleno: 'rgba(255,255,255,0.05)', texto: '#FFFFFF', textoSec: '#C9D4E8' },
    podio: { tipo: 'ninguno', tapa: ['#20242E', '#0B0D12'], cuerpo: ['#14171E', '#030405'], borde: '#3E4A63', brillo: '#6C7DA0', sombra: '#2E86E8' },
    adornos: [],
    capas: [
      { t: 'luz', ref: 'lienzo', x: 0.5, y: 0.0, rx: 0.9, ry: 0.5, color: '#CFE3FF', op: 0.24 },
      { t: 'poli', pts: [[0.44, 0], [0.56, 0], [0.94, 0.72], [0.06, 0.72]], relleno: '#CFE3FF', op: 0.07 },
      { t: 'luz', ref: 'foto', x: 0.22, y: 0.6, rx: 0.5, ry: 0.5, color: MORADO, op: 0.34 },
      { t: 'luz', ref: 'foto', x: 0.86, y: 0.5, rx: 0.45, ry: 0.5, color: '#2E86E8', op: 0.34 },
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.98, rx: 0.8, ry: 0.22, color: '#2E86E8', op: 0.5 },
      { t: 'piso', ancho: 0.9, alto: 0.15, color: [AZUL_CL, MORADO_CL], op: 0.9, grosor: 3 },
    ],
    foto: { reflejo: 0.5, sombra: 'estudio' },
    chip: { relleno: [AZUL, MORADO], texto: '#FFFFFF' },
    logo: 'claro', pie: '#8593AE',
  },

  // 07 · revista tecnologica: blanco perla, tipografia grande y jerarquizada, distribucion asimetrica, tarjetas pequenas
  'tech-editorial': {
    id: 'tech-editorial', nombre: 'TECH EDITORIAL', familia: 'editorial',
    fondo: { angulo: 90, paradas: [[0, PERLA], [1, PERLA]] },
    texto: '#0A0A0F', textoSec: '#555A6B',
    acento: [AZUL, MORADO],
    titulo: { ancla: 'start' },
    icono: { estilo: 'linea', color: AZUL, relleno: 'none', borde: 'none' },
    precio: { color: ['#0A0A0F', '#0A0A0F'], desde: '#5B5F6E', acento: [AZUL, MORADO] },
    garantia: { estilo: 'borde', borde: AZUL, relleno: 'rgba(19,103,164,0.06)', texto: '#0A0A0F', textoSec: AZUL },
    podio: { tipo: 'ninguno', tapa: ['#FFFFFF', '#EFEBE2'], cuerpo: ['#E7E2D8', '#CFC9BC'], borde: '#FFFFFF', brillo: '#FFFFFF', sombra: '#5A5A66' },
    adornos: [],
    capas: [
      { t: 'linea', x1: 0.055, y1: 0.105, x2: 0.945, y2: 0.105, color: [AZUL, MORADO], op: 0.9, grosor: 3 },
      { solo: '4x5', t: 'poli', pts: [[0.47, 0.33], [0.96, 0.3], [0.96, 0.8], [0.4, 0.83]], relleno: AZUL, op: 0.07, trazo: AZUL, opTrazo: 0.55, grosor: 2 },
      { solo: '4x5', t: 'poli', pts: [[0.9, 0.3], [0.96, 0.3], [0.96, 0.335], [0.9, 0.335]], relleno: MORADO, op: 1 },
      { t: 'puntos', x: 0.8, y: 0.06, cols: 5, filas: 2, paso: 20, color: MORADO, op: 0.6, r: 2.2 },
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.7, ry: 0.65, color: '#FFFFFF', op: 0.7 },
    ],
    tarjeta: { relleno: '#FFFFFF', borde: '#D6D2C7', opRelleno: 1 },
    chip: { relleno: [AZUL, MORADO], texto: '#FFFFFF' },
    logo: 'oscuro', pie: '#7C8092',
  },

  // 08 · superficies translucidas: negro azulado, paneles de cristal con borde azul-morado, reflejos suaves
  'modern-glass': {
    id: 'modern-glass', nombre: 'MODERN GLASS', familia: 'clasico',
    fondo: { angulo: 90, paradas: [[0, '#060A1C'], [1, '#0A1030']] },
    texto: '#F4F6FF', textoSec: '#AAB4D8',
    acento: ['#6CB7F5', '#C58CF0'],
    titulo: { ancla: 'start' },
    icono: { estilo: 'circulo', color: '#E9EEFF', relleno: 'rgba(255,255,255,0.08)', borde: 'rgba(160,190,255,0.7)' },
    precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#B8C2E4' },
    garantia: { estilo: 'relleno', borde: '#9FC4F5', relleno: 'rgba(255,255,255,0.1)', texto: '#FFFFFF', textoSec: '#C8D6F5' },
    podio: { tipo: 'ninguno', tapa: ['#1B2A5A', '#0B1233'], cuerpo: ['#101A44', '#060A1C'], borde: '#6CB7F5', brillo: '#3F8EE0', sombra: '#3F7BE8' },
    adornos: [],
    capas: [
      { t: 'luz', ref: 'lienzo', x: 0.15, y: 0.25, rx: 0.7, color: AZUL, op: 0.7 },
      { t: 'luz', ref: 'lienzo', x: 0.9, y: 0.58, rx: 0.6, color: MORADO, op: 0.65 },
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.5, rx: 0.7, ry: 0.7, color: '#4C8FE8', op: 0.4 },
      { t: 'panel', ref: 'titulo', pad: 30, rx: 36, relleno: '#FFFFFF', opRelleno: 0.07, borde: [AZUL_CL, MORADO_CL], opBorde: 0.75, brillo: 0.18 },
      { solo: '4x5', t: 'panel', ref: 'foto', pad: 24, rx: 44, relleno: '#FFFFFF', opRelleno: 0.06, borde: [AZUL_CL, MORADO_CL], opBorde: 0.75, brillo: 0.16 },
      { t: 'panel', ref: 'precio', pad: 26, rx: 32, relleno: '#FFFFFF', opRelleno: 0.08, borde: [AZUL_CL, MORADO_CL], opBorde: 0.75, brillo: 0.18 },
      { t: 'panel', ref: 'lista', pad: 22, rx: 32, relleno: '#FFFFFF', opRelleno: 0.07, borde: [MORADO_CL, AZUL_CL], opBorde: 0.7, brillo: 0.16 },
    ],
    foto: { sombra: 'estudio' },
    chip: { relleno: [AZUL, MORADO], texto: '#FFFFFF' },
    logo: 'claro', pie: '#8C97C0',
  },

  // 09 · energia y movimiento: negro, bandas diagonales azul y morada, producto inclinado, tipografia contundente
  'dynamic-tech': {
    id: 'dynamic-tech', nombre: 'DYNAMIC TECH', familia: 'centrado',
    fondo: { angulo: 90, paradas: [[0, '#000000'], [1, '#02040C']] },
    texto: '#FFFFFF', textoSec: '#B5C2EE',
    acento: ['#35C6FF', MORADO_CL],
    titulo: { ancla: 'start' },
    icono: { estilo: 'circulo', color: '#FFFFFF', relleno: 'rgba(80,140,255,0.16)', borde: 'rgba(120,190,255,0.85)' },
    precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#B5C2EE' },
    garantia: { estilo: 'borde', borde: '#6FB4FF', relleno: 'rgba(80,140,255,0.14)', texto: '#FFFFFF', textoSec: '#BFD6FF' },
    podio: { tipo: 'ninguno', tapa: ['#1A2A8A', '#0A1348'], cuerpo: ['#101C66', '#050A2C'], borde: '#4FA3FF', brillo: '#3F8BFF', sombra: '#2E86E8' },
    adornos: [],
    capas: [
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.6, rx: 0.8, ry: 0.7, color: AZUL, op: 0.45 },
      { t: 'banda', x: 0.55, y: 0.62, largo: 1700, grosor: 120, angulo: -28, color: [AZUL, '#2EA4F0'], op: 0.55 },
      { t: 'banda', x: 0.5, y: 0.7, largo: 1700, grosor: 46, angulo: -28, color: [MORADO, '#D06BFF'], op: 0.7 },
      { t: 'banda', x: 0.45, y: 0.53, largo: 1700, grosor: 16, angulo: -28, color: ['#2EA4F0', '#FFFFFF'], op: 0.55 },
      { t: 'banda', x: 0.6, y: 0.79, largo: 1500, grosor: 10, angulo: -28, color: [MORADO_CL, AZUL_CL], op: 0.75 },
      { t: 'banda', x: 0.2, y: 0.46, largo: 900, grosor: 6, angulo: -28, color: [AZUL_CL, '#FFFFFF'], op: 0.5 },
    ],
    foto: { rot: -7, sombra: 'estudio' },
    chip: { relleno: [AZUL, MORADO], texto: '#FFFFFF' },
    logo: 'claro', pie: '#8D9BD8',
  },

  // 10 · lujo minimalista: la mas sobria; blanco perla (o negro segun el producto), detalles corporativos muy discretos
  'luxury-minimal': {
    id: 'luxury-minimal', nombre: 'LUXURY MINIMAL', familia: 'editorial',
    fondo: { angulo: 90, paradas: [[0, PERLA], [1, PERLA]] },
    texto: '#0A0A0F', textoSec: '#4A4F5E',
    acento: ['#0A0A0F', '#0A0A0F'],
    titulo: { ancla: 'start', peso: 'bold' },
    icono: { estilo: 'linea', color: '#0A0A0F', relleno: 'none', borde: '#0A0A0F' },
    precio: { color: ['#0A0A0F', '#0A0A0F'], desde: '#5C6171', acento: [AZUL, MORADO] },
    garantia: { estilo: 'borde', borde: '#0A0A0F', relleno: 'none', texto: '#0A0A0F', textoSec: '#4A4F5E' },
    podio: { tipo: 'ninguno', tapa: ['#FFFFFF', '#EFEBE2'], cuerpo: ['#E7E2D8', '#CFC9BC'], borde: '#FFFFFF', brillo: '#FFFFFF', sombra: '#5A5A66' },
    adornos: [],
    capas: [
      { solo: '4x5', t: 'poli', pts: [[0.04, 0.03], [0.96, 0.03], [0.96, 0.893], [0.04, 0.893]], relleno: 'none', op: 0, trazo: '#0A0A0F', opTrazo: 0.8, grosor: 1.2 },
      { t: 'linea', x1: 0.07, y1: 0.108, x2: 0.93, y2: 0.108, color: [AZUL, MORADO], op: 0.9, grosor: 2 },
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.7, ry: 0.65, color: '#FFFFFF', op: 0.9 },
    ],
    chip: { relleno: [AZUL, MORADO], texto: '#FFFFFF' },
    logo: 'oscuro', pie: '#8A8FA3',
  },
};

export const IDS_PLANTILLAS = Object.keys(PLANTILLAS) as PlantillaId[];

// ── LUXURY MINIMAL: fondo blanco perla o negro segun el producto ─────────────────────────────
export type VarianteFondo = 'claro' | 'oscuro';

/** Misma plantilla sobre negro: texto perla, logo claro, luces azul y morada muy discretas y sombra de estudio. */
const LUXURY_OSCURA: Plantilla = {
  ...PLANTILLAS['luxury-minimal'],
  fondo: { angulo: 90, paradas: [[0, '#000000'], [1, '#000000']] },
  texto: '#F4F1EA', textoSec: '#B2B7C6',
  acento: ['#F4F1EA', '#F4F1EA'],
  icono: { estilo: 'linea', color: '#F4F1EA', relleno: 'none', borde: '#F4F1EA' },
  precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#A5ABBD', acento: [AZUL_CL, MORADO_CL] },
  garantia: { estilo: 'borde', borde: '#F4F1EA', relleno: 'none', texto: '#F4F1EA', textoSec: '#B2B7C6' },
  podio: { tipo: 'ninguno', tapa: ['#16181F', '#07080B'], cuerpo: ['#0E1015', '#000000'], borde: '#2A7BC8', brillo: '#3F8EE0', sombra: '#2E86E8' },
  capas: [
    { solo: '4x5', t: 'poli', pts: [[0.04, 0.03], [0.96, 0.03], [0.96, 0.893], [0.04, 0.893]], relleno: 'none', op: 0, trazo: '#F4F1EA', opTrazo: 0.7, grosor: 1.2 },
    { t: 'linea', x1: 0.07, y1: 0.108, x2: 0.93, y2: 0.108, color: [AZUL_CL, MORADO_CL], op: 0.9, grosor: 2 },
    { t: 'luz', ref: 'foto', x: 0.35, y: 0.6, rx: 0.8, ry: 0.7, color: AZUL, op: 0.28 },
    { t: 'luz', ref: 'foto', x: 0.8, y: 0.45, rx: 0.6, ry: 0.6, color: MORADO, op: 0.22 },
  ],
  foto: { sombra: 'estudio' },
  logo: 'claro', pie: '#7F8596',
};

/** La plantilla lista para dibujar: igual a PLANTILLAS[id], salvo LUXURY MINIMAL con fondo 'oscuro'. */
export function plantillaDe(id: PlantillaId, variante?: VarianteFondo): Plantilla {
  return id === 'luxury-minimal' && variante === 'oscuro' ? LUXURY_OSCURA : PLANTILLAS[id];
}

/**
 * Variante sugerida de LUXURY MINIMAL segun el producto: negro si el nombre indica que el producto es BLANCO (contraste), perla en cualquier otro caso.
 * Solo mira el nombre real del inventario; no inventa nada. La interfaz puede ignorarla y fijar `ctx.variante`.
 */
export function varianteSugerida(p: Pick<DatosProducto, 'nombre'> | null | undefined): VarianteFondo {
  const t = (p?.nombre ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return /\b(blanc[oa]s?|white|perla|plateado|silver)\b/.test(t) ? 'oscuro' : 'claro';
}
