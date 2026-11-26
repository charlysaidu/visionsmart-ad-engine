import type { Plantilla } from './tipos.ts';
import { AZUL, AZUL_CL, MORADO, MORADO_CL, PERLA } from './paleta.ts';

// COLECCION 02 (motor 1.1.0): plantillas 11 a 20. Misma arquitectura que la coleccion 01: paleta + capas decorativas (JSON puro);
// la disposicion 4:5 de cada una vive en layouts.ts (D45). Las 10 plantillas de la coleccion 01 no se tocan.
const NEGRO = '#000000';
const FONDO_NEGRO = { angulo: 90, paradas: [[0, NEGRO], [1, NEGRO]] } as Plantilla['fondo'];
const FONDO_PERLA = { angulo: 90, paradas: [[0, PERLA], [1, PERLA]] } as Plantilla['fondo'];
const PODIO_NINGUNO = { tipo: 'ninguno' as const, tapa: ['#16181F', '#07080B'], cuerpo: ['#0E1015', '#000000'], borde: '#2A7BC8', brillo: '#3F8EE0' };

export const PLANTILLAS_02: Record<'neon-edge' | 'clean-hex' | 'cosmic-flow' | 'minimal-stripes' | 'black-grid' | 'pearl-wave' | 'dual-tone' | 'info-box' | 'vision-frame' | 'diagonal-split', Plantilla> = {
  // 11 · neon elegante: negro, lineas luminosas en diagonal tras el producto, luz ambiental, boton de degradado
  'neon-edge': {
    id: 'neon-edge', nombre: 'NEON EDGE', numero: 11, coleccion: 2, descripcion: 'Neon elegante: lineas luminosas en diagonal', familia: 'clasico',
    fondo: FONDO_NEGRO, texto: '#FFFFFF', textoSec: '#AEB6CA', acento: [AZUL_CL, MORADO_CL],
    titulo: { ancla: 'end' },
    icono: { estilo: 'circulo', color: '#FFFFFF', relleno: 'rgba(255,255,255,0.05)', borde: 'rgba(120,175,235,0.85)' },
    precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#C7CCDA' },
    garantia: { estilo: 'boton', borde: '#FFFFFF', relleno: AZUL, texto: '#FFFFFF', textoSec: '#F6F8FD', degradado: [AZUL, MORADO] },
    podio: { ...PODIO_NINGUNO, sombra: '#2E86E8' }, adornos: [],
    capas: [
      { t: 'luz', ref: 'foto', x: 0.2, y: 0.55, rx: 0.9, ry: 0.8, color: '#1E7BDB', op: 0.5 },
      { t: 'luz', ref: 'foto', x: 0.9, y: 0.3, rx: 0.7, ry: 0.7, color: MORADO, op: 0.42 },
      { t: 'banda', x: 0.33, y: 0.6, largo: 760, grosor: 120, angulo: -35, color: [AZUL, MORADO], op: 0.22 },
      { t: 'banda', x: 0.33, y: 0.6, largo: 760, grosor: 4, angulo: -35, color: [AZUL_CL, MORADO_CL], op: 0.95 },
      { t: 'banda', x: 0.3, y: 0.66, largo: 600, grosor: 2, angulo: -35, color: [MORADO_CL, AZUL_CL], op: 0.6 },
      { t: 'banda', x: 0.38, y: 0.52, largo: 520, grosor: 2, angulo: -35, color: [AZUL_CL, MORADO_CL], op: 0.6 },
      { t: 'banda', x: 0.1, y: 0.19, largo: 360, grosor: 3, angulo: -35, color: [AZUL_CL, MORADO_CL], op: 0.8 },
      { t: 'banda', x: 0.07, y: 0.24, largo: 260, grosor: 2, angulo: -35, color: [MORADO_CL, AZUL_CL], op: 0.55 },
      { t: 'piso', ancho: 0.9, alto: 0.13, color: [AZUL_CL, MORADO_CL], op: 0.8, grosor: 3 },
      { solo: '4x5', t: 'puntos', x: 0.07, y: 0.37, cols: 3, filas: 3, paso: 20, color: AZUL_CL, op: 0.55, r: 2.2 },
    ],
    foto: { sombra: 'estudio' }, chip: { lado: 'der', relleno: [AZUL, MORADO], texto: '#FFFFFF' }, logo: 'claro', pie: '#8A90A2',
  },

  // 12 · minimalismo geometrico: blanco perla, hexagonos en azul y morado, bloques pequenos, pieza editorial
  'clean-hex': {
    id: 'clean-hex', nombre: 'CLEAN HEX', numero: 12, coleccion: 2, descripcion: 'Minimalismo geometrico con detalles hexagonales', familia: 'editorial',
    fondo: FONDO_PERLA, texto: '#0A0A0F', textoSec: '#555A6B', acento: [AZUL, MORADO],
    titulo: { ancla: 'start' },
    icono: { estilo: 'linea', color: AZUL, relleno: 'none', borde: 'none' },
    precio: { color: ['#0A0A0F', '#0A0A0F'], desde: '#5F6372', acento: [AZUL, MORADO] },
    garantia: { estilo: 'borde', borde: AZUL, relleno: 'rgba(19,103,164,0.06)', texto: '#0A0A0F', textoSec: AZUL },
    podio: { ...PODIO_NINGUNO, sombra: '#5A5A66' }, adornos: [],
    capas: [
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.75, ry: 0.7, color: '#FFFFFF', op: 0.9 },
      { t: 'hex', x: 0.72, y: 0.42, r: 0.27, trazo: [AZUL, MORADO], opTrazo: 0.5, grosor: 2, relleno: AZUL, opRelleno: 0.05 },
      { t: 'hex', x: 0.56, y: 0.64, r: 0.13, trazo: [MORADO], opTrazo: 0.5, grosor: 2 },
      { t: 'hex', x: 0.92, y: 0.64, r: 0.09, trazo: [AZUL], opTrazo: 0.5, grosor: 2, relleno: MORADO, opRelleno: 0.1 },
      { t: 'hex', x: 0.12, y: 0.52, r: 0.1, trazo: [AZUL], opTrazo: 0.45, grosor: 2, relleno: AZUL, opRelleno: 0.05 },
      { t: 'hex', x: 0.24, y: 0.62, r: 0.055, trazo: [MORADO], opTrazo: 0.5, grosor: 2 },
      { t: 'hex', x: 0.07, y: 0.67, r: 0.03, relleno: MORADO, opRelleno: 0.9 },
      { solo: '4x5', t: 'linea', x1: 0.055, y1: 0.105, x2: 0.945, y2: 0.105, color: [AZUL, MORADO], op: 0.9, grosor: 2 },
    ],
    tarjeta: { relleno: '#FFFFFF', borde: '#D6D2C7', opRelleno: 1 }, chip: { lado: 'der', relleno: [AZUL, MORADO], texto: '#FFFFFF' }, logo: 'oscuro', pie: '#7C8092',
  },

  // 13 · profundidad y movimiento: negro, ondas luminosas moradas y azules que no ocultan al producto
  'cosmic-flow': {
    id: 'cosmic-flow', nombre: 'COSMIC FLOW', numero: 13, coleccion: 2, descripcion: 'Ondas de luz con profundidad sobre negro', familia: 'centrado',
    fondo: FONDO_NEGRO, texto: '#FFFFFF', textoSec: '#B5BDD6', acento: ['#7CC4F5', '#D3A2F5'],
    titulo: { ancla: 'start' },
    icono: { estilo: 'circulo', color: '#FFFFFF', relleno: 'rgba(160,120,255,0.14)', borde: 'rgba(170,160,255,0.8)' },
    precio: { color: ['#FFFFFF', '#E8D9FF'], desde: '#CDD3E6' },
    garantia: { estilo: 'borde', borde: 'rgba(255,255,255,0.75)', relleno: 'rgba(255,255,255,0.06)', texto: '#FFFFFF', textoSec: '#CDD3E6' },
    podio: { ...PODIO_NINGUNO, sombra: MORADO }, adornos: [],
    capas: [
      { t: 'disco', ref: 'lienzo', x: 0.85, y: 0.5, r: 0.4, color: MORADO, op: 0.32 },
      { t: 'luz', ref: 'foto', x: 0.25, y: 0.6, rx: 0.8, ry: 0.7, color: AZUL, op: 0.5 },
      { t: 'onda', y: 0.44, amp: 0.035, largo: 1.0, fase: 0.2, color: [AZUL_CL, MORADO_CL], op: 0.35, grosor: 2 },
      { t: 'onda', y: 0.72, amp: 0.05, largo: 0.9, fase: 0.1, color: [AZUL, MORADO], op: 0.85, grosor: 3, relleno: 'abajo', opRelleno: 0.28 },
      { t: 'onda', y: 0.77, amp: 0.045, largo: 0.75, fase: 0.4, color: [MORADO_CL, AZUL_CL], op: 0.6, grosor: 2, relleno: 'abajo', opRelleno: 0.2 },
      { t: 'onda', y: 0.82, amp: 0.04, largo: 1.1, fase: 0.7, color: [AZUL_CL, MORADO_CL], op: 0.45, grosor: 2, relleno: 'abajo', opRelleno: 0.16 },
    ],
    foto: { sombra: 'estudio' }, chip: { lado: 'der', relleno: [AZUL, MORADO], texto: '#FFFFFF' }, logo: 'claro', pie: '#A9B0C6',
  },

  // 14 · elegancia por lineas: blanco perla, lineas verticales azules y moradas, composicion asimetrica con columna de texto a la derecha
  'minimal-stripes': {
    id: 'minimal-stripes', nombre: 'MINIMAL STRIPES', numero: 14, coleccion: 2, descripcion: 'Lineas verticales y composicion asimetrica', familia: 'clasico',
    fondo: FONDO_PERLA, texto: '#0A0A0F', textoSec: '#555A6B', acento: [AZUL, MORADO],
    titulo: { ancla: 'start' },
    icono: { estilo: 'linea', color: AZUL, relleno: 'none', borde: 'none' },
    precio: { color: ['#0A0A0F', '#0A0A0F'], desde: '#5F6372', acento: [AZUL, MORADO] },
    garantia: { estilo: 'relleno', borde: AZUL, relleno: AZUL, texto: '#FFFFFF', textoSec: '#FFFFFF' },
    podio: { ...PODIO_NINGUNO, sombra: '#5A5A66' }, adornos: [],
    capas: [
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.75, ry: 0.7, color: '#FFFFFF', op: 0.9 },
      { solo: '4x5', t: 'linea', x1: 0.648, y1: 0.16, x2: 0.648, y2: 0.93, color: [AZUL, MORADO], op: 0.85, grosor: 2 },
      { solo: '4x5', t: 'linea', x1: 0.72, y1: 0.015, x2: 0.72, y2: 0.1, color: [AZUL, MORADO], op: 0.9, grosor: 4 },
      { solo: '4x5', t: 'linea', x1: 0.76, y1: 0.015, x2: 0.76, y2: 0.07, color: [MORADO, AZUL], op: 0.8, grosor: 3 },
      { solo: '4x5', t: 'linea', x1: 0.8, y1: 0.015, x2: 0.8, y2: 0.115, color: [AZUL, MORADO], op: 0.9, grosor: 5 },
      { solo: '4x5', t: 'linea', x1: 0.84, y1: 0.015, x2: 0.84, y2: 0.06, color: [MORADO, AZUL], op: 0.7, grosor: 3 },
      { solo: '4x5', t: 'linea', x1: 0.88, y1: 0.015, x2: 0.88, y2: 0.09, color: [AZUL, MORADO], op: 0.85, grosor: 4 },
      { solo: '4x5', t: 'linea', x1: 0.92, y1: 0.015, x2: 0.92, y2: 0.05, color: [MORADO, AZUL], op: 0.7, grosor: 2 },
      { solo: '4x5', t: 'linea', x1: 0.06, y1: 0.885, x2: 0.06, y2: 0.915, color: [AZUL, MORADO], op: 0.8, grosor: 3 },
      { solo: '4x5', t: 'linea', x1: 0.085, y1: 0.875, x2: 0.085, y2: 0.915, color: [MORADO, AZUL], op: 0.8, grosor: 3 },
      { solo: '4x5', t: 'linea', x1: 0.11, y1: 0.89, x2: 0.11, y2: 0.915, color: [AZUL, MORADO], op: 0.8, grosor: 3 },
    ],
    chip: { lado: 'der', relleno: [AZUL, MORADO], texto: '#FFFFFF' }, logo: 'oscuro', pie: '#7C8092',
  },

  // 15 · tecnologia estructurada: negro, cuadricula sutil, puntos y lineas azules y moradas, iconos lineales
  'black-grid': {
    id: 'black-grid', nombre: 'BLACK GRID', numero: 15, coleccion: 2, descripcion: 'Cuadricula tecnica y precision', familia: 'centrado',
    fondo: FONDO_NEGRO, texto: '#FFFFFF', textoSec: '#AEB6CA', acento: [AZUL_CL, MORADO_CL],
    titulo: { ancla: 'start' },
    icono: { estilo: 'linea', color: '#8FC6F5', relleno: 'none', borde: 'none' },
    precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#C7CCDA', acento: [AZUL_CL, MORADO_CL] },
    garantia: { estilo: 'borde', borde: '#6FB4FF', relleno: 'rgba(80,140,255,0.1)', texto: '#FFFFFF', textoSec: '#C3D8FA' },
    podio: { ...PODIO_NINGUNO, sombra: '#2E86E8' }, adornos: [],
    capas: [
      { t: 'rejilla', x0: 0, y0: 0, x1: 1, y1: 1, paso: 60, color: '#FFFFFF', op: 0.05, grosor: 1 },
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.8, ry: 0.7, color: AZUL, op: 0.4 },
      { t: 'luz', ref: 'foto', x: 0.95, y: 0.2, rx: 0.5, ry: 0.5, color: MORADO, op: 0.3 },
      { t: 'marco', ref: 'foto', color: [AZUL_CL, MORADO_CL], op: 0.8, inset: 0, largo: 40, grosor: 2.5 },
      { solo: '4x5', t: 'linea', x1: 0.05, y1: 0.612, x2: 0.95, y2: 0.612, color: [AZUL_CL, MORADO_CL], op: 0.55, grosor: 1.5 },
      { solo: '4x5', t: 'puntos', x: 0.8, y: 0.15, cols: 5, filas: 3, paso: 30, color: MORADO_CL, op: 0.6, r: 2.4 },
      { solo: '4x5', t: 'puntos', x: 0.06, y: 0.15, cols: 4, filas: 3, paso: 30, color: AZUL_CL, op: 0.6, r: 2.4 },
    ],
    foto: { sombra: 'estudio' }, chip: { lado: 'der', relleno: [AZUL, MORADO], texto: '#FFFFFF' }, logo: 'claro', pie: '#8A90A2',
  },

  // 16 · blanco perla y movimiento suave: ondas abstractas, producto grande centrado, sombras naturales
  'pearl-wave': {
    id: 'pearl-wave', nombre: 'PEARL WAVE', numero: 16, coleccion: 2, descripcion: 'Ondas suaves sobre blanco perla', familia: 'centrado',
    fondo: FONDO_PERLA, texto: '#0A0A0F', textoSec: '#555A6B', acento: [AZUL, MORADO],
    titulo: { ancla: 'start' },
    icono: { estilo: 'linea', color: AZUL, relleno: 'none', borde: 'none' },
    precio: { color: ['#0A0A0F', '#0A0A0F'], desde: '#5F6372', acento: [AZUL, MORADO] },
    garantia: { estilo: 'borde', borde: MORADO, relleno: 'rgba(157,63,203,0.05)', texto: '#0A0A0F', textoSec: '#7A2FA0' },
    podio: { ...PODIO_NINGUNO, sombra: '#5A5A66' }, adornos: [],
    capas: [
      { t: 'onda', y: 0.08, amp: 0.02, largo: 0.7, fase: 0.1, color: [AZUL, MORADO], op: 0.5, grosor: 2, relleno: 'arriba', opRelleno: 0.1 },
      { t: 'onda', y: 0.56, amp: 0.06, largo: 0.8, fase: 0.05, color: [AZUL, MORADO], op: 0.65, grosor: 2.5, relleno: 'abajo', opRelleno: 0.1 },
      { t: 'onda', y: 0.62, amp: 0.05, largo: 1.0, fase: 0.35, color: [MORADO, AZUL], op: 0.55, grosor: 2, relleno: 'abajo', opRelleno: 0.08 },
      { solo: '4x5', t: 'onda', y: 0.945, amp: 0.02, largo: 0.9, fase: 0.2, color: [AZUL, MORADO], op: 0.4, grosor: 2, relleno: 'abajo', opRelleno: 0.12 },
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.7, ry: 0.65, color: '#FFFFFF', op: 0.9 },
    ],
    chip: { lado: 'der', relleno: [AZUL, MORADO], texto: '#FFFFFF' }, logo: 'oscuro', pie: '#8A8D98',
  },

  // 17 · contraste de colores corporativos: negro arriba, banda azul y base morada separadas por diagonales limpias; el producto cruza las secciones
  'dual-tone': {
    id: 'dual-tone', nombre: 'DUAL TONE', numero: 17, coleccion: 2, descripcion: 'Negro, azul y morado en secciones diagonales', familia: 'centrado',
    fondo: FONDO_NEGRO, texto: '#FFFFFF', textoSec: '#D6E8F7', acento: ['#FFFFFF', '#FFFFFF'],
    titulo: { ancla: 'start' },
    icono: { estilo: 'circulo', color: '#FFFFFF', relleno: 'rgba(255,255,255,0.12)', borde: 'rgba(255,255,255,0.75)' },
    precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#FBF4FE' },
    garantia: { estilo: 'relleno', borde: '#FFFFFF', relleno: '#FFFFFF', texto: '#6B2A8E', textoSec: '#6B2A8E' },
    podio: { ...PODIO_NINGUNO, sombra: '#0A2A4A' }, adornos: [],
    capas: [
      { t: 'poli', pts: [[0, 0.27], [1, 0.215], [1, 0.7], [0, 0.745]], relleno: AZUL, op: 1 },
      { t: 'poli', pts: [[0, 0.745], [1, 0.7], [1, 1], [0, 1]], relleno: MORADO, op: 1 },
      { t: 'linea', x1: 0, y1: 0.27, x2: 1, y2: 0.215, color: ['#FFFFFF'], op: 0.55, grosor: 2 },
      { t: 'linea', x1: 0, y1: 0.745, x2: 1, y2: 0.7, color: ['#FFFFFF'], op: 0.55, grosor: 2 },
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.8, ry: 0.7, color: '#FFFFFF', op: 0.3 },
    ],
    superficies: { titulo: [NEGRO, AZUL], precio: [MORADO] },
    foto: { sombra: 'estudio' }, chip: { lado: 'der', relleno: ['#FFFFFF', '#FFFFFF'], texto: AZUL }, logo: 'claro', pie: '#D9C8EA',
  },

  // 18 · informacion organizada: blanco perla, producto en tarjeta, bloques informativos con bordes finos (solo datos reales del inventario)
  'info-box': {
    id: 'info-box', nombre: 'INFO BOX', numero: 18, coleccion: 2, descripcion: 'Bloques informativos con datos reales del producto', familia: 'editorial',
    fondo: FONDO_PERLA, texto: '#0A0A0F', textoSec: '#555A6B', acento: ['#0A0A0F', '#0A0A0F'],
    titulo: { ancla: 'start' },
    icono: { estilo: 'linea', color: AZUL, relleno: 'none', borde: 'none' },
    precio: { color: ['#0A0A0F', '#0A0A0F'], desde: '#5F6372', acento: [AZUL, MORADO] },
    garantia: { estilo: 'borde', borde: '#0A0A0F', relleno: 'rgba(255,255,255,0.6)', texto: '#0A0A0F', textoSec: '#4A4F5E' },
    podio: { ...PODIO_NINGUNO, sombra: '#5A5A66' }, adornos: [],
    capas: [
      { solo: '4x5', t: 'linea', x1: 0.055, y1: 0.105, x2: 0.945, y2: 0.105, color: [AZUL, MORADO], op: 0.9, grosor: 3 },
      { solo: '4x5', t: 'panel', ref: 'foto', pad: 10, rx: 28, relleno: '#FFFFFF', opRelleno: 0.6, borde: ['#D6D2C7', '#D6D2C7'], opBorde: 0.95, brillo: 0 },
      { solo: '4x5', t: 'panel', ref: 'lista', pad: 14, rx: 22, relleno: '#FFFFFF', opRelleno: 0.45, borde: [AZUL, MORADO], opBorde: 0.55, brillo: 0 },
      { solo: '4x5', t: 'puntos', x: 0.84, y: 0.06, cols: 5, filas: 2, paso: 20, color: MORADO, op: 0.55, r: 2.2 },
    ],
    tarjeta: { relleno: '#FFFFFF', borde: '#D6D2C7', opRelleno: 1 }, chip: { lado: 'der', relleno: [AZUL, MORADO], texto: '#FFFFFF' }, logo: 'oscuro', pie: '#7C8092',
  },

  // 19 · marco luminoso corporativo: negro, marco fino con degradado azul-morado, simetria premium
  'vision-frame': {
    id: 'vision-frame', nombre: 'VISION FRAME', numero: 19, coleccion: 2, descripcion: 'Marco luminoso azul y morado, composicion simetrica', familia: 'centrado',
    fondo: FONDO_NEGRO, texto: '#FFFFFF', textoSec: '#AEB6CA', acento: ['#FFFFFF', '#E6D2FA'],
    titulo: { ancla: 'start' },
    icono: { estilo: 'circulo', color: '#FFFFFF', relleno: 'rgba(255,255,255,0.05)', borde: 'rgba(140,190,240,0.85)' },
    precio: { color: ['#FFFFFF', '#FFFFFF'], desde: '#C7CCDA', acento: [AZUL_CL, MORADO_CL] },
    garantia: { estilo: 'borde', borde: 'rgba(255,255,255,0.8)', relleno: 'rgba(255,255,255,0.05)', texto: '#FFFFFF', textoSec: '#C7CCDA' },
    podio: { ...PODIO_NINGUNO, sombra: '#2E86E8' }, adornos: [],
    capas: [
      { t: 'luz', ref: 'lienzo', x: 0.05, y: 0.05, rx: 0.5, color: AZUL, op: 0.38 },
      { t: 'luz', ref: 'lienzo', x: 0.95, y: 0.9, rx: 0.5, color: MORADO, op: 0.36 },
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.8, ry: 0.7, color: '#3A6BD8', op: 0.34 },
      { solo: '4x5', t: 'borde', inset: 36, rx: 28, color: [AZUL_CL, MORADO_CL], op: 0.9, grosor: 2, hasta: 1205 },
      { solo: 'otros', t: 'marco', ref: 'lienzo', color: [AZUL_CL, MORADO_CL], op: 0.85, inset: 30, largo: 70, grosor: 3 },
      { t: 'piso', ancho: 0.7, alto: 0.1, color: [AZUL_CL, MORADO_CL], op: 0.6, grosor: 2.5 },
    ],
    foto: { sombra: 'estudio' }, chip: { lado: 'der', relleno: [AZUL, MORADO], texto: '#FFFFFF' }, logo: 'claro', pie: '#8A90A2',
  },

  // 20 · composicion diagonal: blanco perla con bloque negro diagonal, franjas azul y morada en el corte, producto protagonista
  'diagonal-split': {
    id: 'diagonal-split', nombre: 'DIAGONAL SPLIT', numero: 20, coleccion: 2, descripcion: 'Bloque negro diagonal sobre blanco perla', familia: 'centrado',
    fondo: FONDO_PERLA, texto: '#0A0A0F', textoSec: '#555A6B', acento: [AZUL_CL, MORADO_CL],
    titulo: { ancla: 'start' },
    icono: { estilo: 'linea', color: AZUL, relleno: 'none', borde: 'none' },
    precio: { color: ['#0A0A0F', '#0A0A0F'], desde: '#5F6372', acento: [AZUL, MORADO] },
    garantia: { estilo: 'relleno', borde: MORADO, relleno: MORADO, texto: '#FFFFFF', textoSec: '#FFFFFF' },
    podio: { ...PODIO_NINGUNO, sombra: '#5A5A66' }, adornos: [],
    capas: [
      { t: 'poli', pts: [[0, 0], [1, 0], [1, 0.3], [0, 0.4]], relleno: NEGRO, op: 1 },
      { t: 'poli', pts: [[0, 0.4], [1, 0.3], [1, 0.318], [0, 0.418]], relleno: AZUL, op: 1 },
      { t: 'poli', pts: [[0, 0.418], [1, 0.318], [1, 0.336], [0, 0.436]], relleno: MORADO, op: 1 },
      { solo: '4x5', t: 'poli', pts: [[1, 0.52], [1, 0.63], [0.9, 0.63]], relleno: AZUL, op: 0.12 },
      { t: 'luz', ref: 'foto', x: 0.5, y: 0.55, rx: 0.7, ry: 0.65, color: '#FFFFFF', op: 0.9 },
    ],
    colores: { titulo: '#FFFFFF', vigencia: '#0A0A0F', tachado: '#0A0A0F' },
    superficies: { titulo: [NEGRO] },
    chip: { lado: 'der', relleno: [AZUL, MORADO], texto: '#FFFFFF' }, logo: 'claro', pie: '#8A8D98',
  },
};
