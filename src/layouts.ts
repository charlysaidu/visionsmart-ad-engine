import type { Ancla, Familia, Formato, Layout, Plantilla, PlantillaId } from './tipos.ts';

const CLASICO: Record<Formato, Layout> = {
  '4x5': {
    logo: { x: 1020, y: 62, h: 56, ancla: 'end' },
    titulo: { x: 60, y: 250, ancho: 540, ancla: 'start', tamMax: 92, tamMin: 50 },
    lista: { x: 60, y: 480, ancho: 370, modo: 'columna', paso: 128, cantidad: 3, tam: 27, icono: 62 },
    foto: { x: 430, y: 290, w: 620, h: 650 },
    podio: { cx: 740, cy: 960, rx: 320, ry: 66, alto: 46 },
    precio: { x: 60, y: 1190, ancho: 540, ancla: 'start', tam: 100 },
    garantia: { x: 790, y: 1100, w: 230, h: 110 },
    pie: { x: 540, y: 1310, ancla: 'middle' },
  },
  '1x1': {
    logo: { x: 1020, y: 50, h: 48, ancla: 'end' },
    titulo: { x: 60, y: 200, ancho: 470, ancla: 'start', tamMax: 70, tamMin: 40 },
    lista: { x: 60, y: 400, ancho: 350, modo: 'columna', paso: 108, cantidad: 3, tam: 24, icono: 54 },
    foto: { x: 470, y: 190, w: 560, h: 560 },
    podio: { cx: 750, cy: 770, rx: 260, ry: 52, alto: 36 },
    precio: { x: 60, y: 940, ancho: 500, ancla: 'start', tam: 84 },
    garantia: { x: 810, y: 860, w: 210, h: 100 },
    pie: { x: 540, y: 1038, ancla: 'middle' },
  },
  '9x16': {
    logo: { x: 1020, y: 80, h: 64, ancla: 'end' },
    titulo: { x: 60, y: 320, ancho: 960, ancla: 'start', tamMax: 104, tamMin: 56 },
    foto: { x: 80, y: 580, w: 920, h: 780 },
    podio: { cx: 540, cy: 1390, rx: 420, ry: 86, alto: 56 },
    lista: { x: 60, y: 1540, ancho: 960, modo: 'fila', paso: 330, cantidad: 3, tam: 24, icono: 60 },
    precio: { x: 60, y: 1800, ancho: 620, ancla: 'start', tam: 116 },
    garantia: { x: 790, y: 1700, w: 230, h: 120 },
    pie: { x: 540, y: 1884, ancla: 'middle' },
  },
};

const CENTRADO: Record<Formato, Layout> = {
  '4x5': {
    logo: { x: 60, y: 62, h: 56, ancla: 'start' },
    titulo: { x: 1020, y: 215, ancho: 560, ancla: 'end', tamMax: 84, tamMin: 48 },
    foto: { x: 190, y: 330, w: 700, h: 590 },
    podio: { cx: 540, cy: 940, rx: 340, ry: 70, alto: 48 },
    lista: { x: 60, y: 1030, ancho: 960, modo: 'fila', paso: 320, cantidad: 3, tam: 25, icono: 58 },
    precio: { x: 60, y: 1250, ancho: 540, ancla: 'start', tam: 96 },
    garantia: { x: 790, y: 1150, w: 230, h: 110 },
    pie: { x: 540, y: 1326, ancla: 'middle' },
  },
  '1x1': {
    logo: { x: 60, y: 50, h: 48, ancla: 'start' },
    titulo: { x: 1020, y: 190, ancho: 600, ancla: 'end', tamMax: 62, tamMin: 40 },
    foto: { x: 200, y: 250, w: 680, h: 420 },
    podio: { cx: 540, cy: 690, rx: 280, ry: 50, alto: 34 },
    lista: { x: 60, y: 790, ancho: 960, modo: 'fila', paso: 320, cantidad: 3, tam: 22, icono: 52 },
    precio: { x: 60, y: 985, ancho: 500, ancla: 'start', tam: 78 },
    garantia: { x: 820, y: 920, w: 200, h: 96 },
    pie: { x: 540, y: 1046, ancla: 'middle' },
  },
  '9x16': {
    logo: { x: 60, y: 80, h: 64, ancla: 'start' },
    titulo: { x: 1020, y: 330, ancho: 800, ancla: 'end', tamMax: 104, tamMin: 56 },
    foto: { x: 80, y: 560, w: 920, h: 740 },
    podio: { cx: 540, cy: 1330, rx: 420, ry: 86, alto: 56 },
    lista: { x: 60, y: 1480, ancho: 960, modo: 'fila', paso: 330, cantidad: 3, tam: 24, icono: 60 },
    precio: { x: 60, y: 1790, ancho: 620, ancla: 'start', tam: 116 },
    garantia: { x: 790, y: 1700, w: 230, h: 120 },
    pie: { x: 540, y: 1884, ancla: 'middle' },
  },
};

const clon = (l: Layout): Layout => JSON.parse(JSON.stringify(l));
function editorial(f: Formato): Layout {
  const l = clon(CLASICO[f]);
  l.logo = { ...l.logo, x: 60, ancla: 'start' };
  l.pie = { ...l.pie, x: 60, ancla: 'start' };
  l.pie.y -= 2;
  if (f === '4x5') { l.precio = { ...l.precio, tam: 84, ancho: 470 }; l.titulo.y = 240; l.lista = { ...l.lista, y: 510, paso: 100, cantidad: 4, icono: 46, tam: 24 }; l.garantia.x = 800; }
  if (f === '1x1') { l.lista = { ...l.lista, cantidad: 4, paso: 92, icono: 44, tam: 22, y: 380 }; }
  if (f === '9x16') {
    l.titulo = { ...l.titulo, ancho: 540, tamMax: 104, tamMin: 54 };
    l.lista = { x: 60, y: 760, ancho: 330, modo: 'columna', paso: 140, cantidad: 4, tam: 26, icono: 58 };
    l.foto = { x: 380, y: 560, w: 660, h: 800 };
    l.podio = { cx: 710, cy: 1380, rx: 330, ry: 70, alto: 48 };
    l.precio = { ...l.precio, tam: 100, ancho: 470 };
  }
  return l;
}

const BASE: Record<Familia, (f: Formato) => Layout> = {
  clasico: (f) => clon(CLASICO[f]),
  centrado: (f) => clon(CENTRADO[f]),
  editorial,
};

// ── DISPOSICIONES 4:5 (1080 x 1350), una por plantilla ──────────────────────────────────────────────────────────
// Reglas del contrato (R20, catalogo PDF borde a borde): todo el contenido queda DENTRO de x 60..1020 y por ENCIMA de y 1190 (la franja inferior
// es del pie translucido del PDF: fecha a la izquierda, numero a la derecha); solo el pie «visionsmart.app · @visionsmart.app» va centrado en y 1310.
// Presupuesto vertical: el titulo reserva hasta 3 lineas (y - 0.9 tam ... y + 2.47 tam) y, en promocion, el precio necesita ~1.3 de su tamano por encima.
const PIE45 = { x: 540, y: 1310, ancla: 'middle' as Ancla };
export const LIMITE_CONTENIDO_4X5 = 1190;

const D45: Record<PlantillaId, Layout> = {
  // 01 · columna de texto a la izquierda, producto grande a la derecha, precio abajo y boton de garantia
  'black-premium': {
    logo: { x: 60, y: 62, h: 56, ancla: 'start' },
    titulo: { x: 60, y: 238, ancho: 640, ancla: 'start', tamMax: 88, tamMin: 36 },
    lista: { x: 60, y: 500, ancho: 320, modo: 'columna', paso: 120, cantidad: 3, tam: 26, icono: 60 },
    foto: { x: 392, y: 300, w: 640, h: 700 },
    podio: { cx: 714, cy: 962, rx: 272, ry: 56, alto: 40 },
    precio: { x: 60, y: 1150, ancho: 580, ancla: 'start', tam: 100 },
    garantia: { x: 730, y: 1062, w: 290, h: 92 },
    pie: PIE45,
  },
  // 02 · producto arriba y centrado, mucho aire; titulo y precio centrados; detalles pequenos
  'pure-white': {
    logo: { x: 60, y: 60, h: 52, ancla: 'start' },
    titulo: { x: 540, y: 832, ancho: 900, ancla: 'middle', tamMax: 60, tamMin: 40 },
    lista: { x: 60, y: 1140, ancho: 960, modo: 'fila', paso: 320, cantidad: 3, tam: 20, icono: 40 },
    foto: { x: 150, y: 116, w: 780, h: 632 },
    podio: { cx: 540, cy: 750, rx: 300, ry: 40, alto: 30 },
    precio: { x: 540, y: 1098, ancho: 560, ancla: 'middle', tam: 88 },
    garantia: { x: 790, y: 56, w: 230, h: 76 },
    pie: PIE45,
  },
  // 03 · titulo arriba, producto a la izquierda, columna de caracteristicas a la derecha, precio grande
  'blue-signature': {
    logo: { x: 64, y: 62, h: 56, ancla: 'start' },
    titulo: { x: 60, y: 238, ancho: 760, ancla: 'start', tamMax: 84, tamMin: 34 },
    lista: { x: 704, y: 470, ancho: 316, modo: 'columna', paso: 150, cantidad: 3, tam: 24, icono: 58 },
    foto: { x: 50, y: 352, w: 640, h: 600 },
    podio: { cx: 370, cy: 910, rx: 270, ry: 50, alto: 36 },
    precio: { x: 60, y: 1150, ancho: 600, ancla: 'start', tam: 108 },
    garantia: { x: 730, y: 1052, w: 290, h: 110 },
    pie: PIE45,
  },
  // 04 · escenario centrado: logo y titulo arriba, producto sobre su plataforma, precio y garantia abajo
  'purple-edition': {
    logo: { x: 540, y: 58, h: 52, ancla: 'middle' },
    titulo: { x: 540, y: 200, ancho: 860, ancla: 'middle', tamMax: 68, tamMin: 42 },
    lista: { x: 60, y: 560, ancho: 320, modo: 'columna', paso: 120, cantidad: 0, tam: 24, icono: 54 },
    foto: { x: 110, y: 372, w: 860, h: 556 },
    podio: { cx: 540, cy: 892, rx: 372, ry: 58, alto: 36 },
    precio: { x: 60, y: 1160, ancho: 540, ancla: 'start', tam: 96 },
    garantia: { x: 760, y: 1072, w: 260, h: 92 },
    pie: PIE45,
  },
  // 05 · el producto flota sobre el degradado de marca; cinta inferior con titulo (izq.) y precio (der.)
  'gradient-experience': {
    logo: { x: 64, y: 60, h: 56, ancla: 'start' },
    titulo: { x: 60, y: 960, ancho: 560, ancla: 'start', tamMax: 62, tamMin: 32 },
    lista: { x: 60, y: 560, ancho: 320, modo: 'columna', paso: 120, cantidad: 0, tam: 24, icono: 54 },
    foto: { x: 70, y: 140, w: 940, h: 720 },
    podio: { cx: 540, cy: 870, rx: 380, ry: 50, alto: 30 },
    precio: { x: 1020, y: 1135, ancho: 440, ancla: 'end', tam: 90 },
    garantia: { x: 790, y: 60, w: 230, h: 84 },
    pie: PIE45,
  },
  // 06 · foto de estudio: el producto ocupa casi todo el cuadro, texto al minimo
  'product-spotlight': {
    logo: { x: 540, y: 56, h: 46, ancla: 'middle' },
    titulo: { x: 60, y: 1046, ancho: 500, ancla: 'start', tamMax: 46, tamMin: 30 },
    lista: { x: 60, y: 560, ancho: 320, modo: 'columna', paso: 120, cantidad: 0, tam: 24, icono: 54 },
    foto: { x: 48, y: 110, w: 984, h: 800 },
    podio: { cx: 540, cy: 910, rx: 420, ry: 60, alto: 40 },
    precio: { x: 1020, y: 1150, ancho: 440, ancla: 'end', tam: 84 },
    garantia: { x: 60, y: 1122, w: 250, h: 66 },
    pie: PIE45,
  },
  // 07 · revista: titulo enorme arriba, tarjetas pequenas a la izquierda, producto a la derecha, precio abajo
  'tech-editorial': {
    logo: { x: 60, y: 62, h: 52, ancla: 'start' },
    titulo: { x: 60, y: 238, ancho: 960, ancla: 'start', tamMax: 100, tamMin: 52 },
    lista: { x: 60, y: 520, ancho: 316, modo: 'columna', paso: 112, cantidad: 3, tam: 21, icono: 42, bloque: true },
    foto: { x: 400, y: 420, w: 620, h: 640 },
    podio: { cx: 710, cy: 1060, rx: 280, ry: 40, alto: 30 },
    precio: { x: 60, y: 1150, ancho: 520, ancla: 'start', tam: 92 },
    garantia: { x: 780, y: 1092, w: 240, h: 84 },
    pie: PIE45,
  },
  // 08 · paneles de cristal: titulo, escenario del producto, precio y caracteristicas en paneles
  'modern-glass': {
    logo: { x: 70, y: 62, h: 52, ancla: 'start' },
    titulo: { x: 96, y: 238, ancho: 880, ancla: 'start', tamMax: 64, tamMin: 40 },
    lista: { x: 650, y: 1018, ancho: 330, modo: 'columna', paso: 54, cantidad: 3, tam: 20, icono: 38 },
    foto: { x: 150, y: 396, w: 780, h: 520 },
    podio: { cx: 540, cy: 920, rx: 300, ry: 40, alto: 30 },
    precio: { x: 104, y: 1132, ancho: 440, ancla: 'start', tam: 80 },
    garantia: { x: 760, y: 56, w: 250, h: 78 },
    pie: PIE45,
  },
  // 09 · energia: titulo grande, caracteristicas en fila, producto inclinado sobre bandas diagonales
  'dynamic-tech': {
    logo: { x: 60, y: 62, h: 56, ancla: 'start' },
    titulo: { x: 60, y: 232, ancho: 800, ancla: 'start', tamMax: 88, tamMin: 36 },
    lista: { x: 60, y: 470, ancho: 960, modo: 'fila', paso: 320, cantidad: 3, tam: 22, icono: 50 },
    foto: { x: 90, y: 560, w: 900, h: 520 },
    podio: { cx: 540, cy: 1085, rx: 360, ry: 50, alto: 34 },
    precio: { x: 60, y: 1150, ancho: 560, ancla: 'start', tam: 100 },
    garantia: { x: 730, y: 1062, w: 290, h: 92 },
    pie: PIE45,
  },
  // 10 · la mas sobria: marco fino, producto limpio al centro, titulo a la izquierda y precio a la derecha
  'luxury-minimal': {
    logo: { x: 76, y: 78, h: 44, ancla: 'start' },
    titulo: { x: 76, y: 1010, ancho: 520, ancla: 'start', tamMax: 50, tamMin: 30 },
    lista: { x: 76, y: 560, ancho: 320, modo: 'columna', paso: 120, cantidad: 0, tam: 24, icono: 54 },
    foto: { x: 160, y: 150, w: 760, h: 780 },
    podio: { cx: 540, cy: 930, rx: 300, ry: 40, alto: 30 },
    precio: { x: 1004, y: 1118, ancho: 400, ancla: 'end', tam: 80 },
    garantia: { x: 76, y: 1112, w: 230, h: 66 },
    pie: PIE45,
  },
};

/** Caracteristicas visibles segun la plantilla en 1x1 y 9x16 (las plantillas minimalistas muestran menos). */
const CANTIDAD_LISTA: Partial<Record<PlantillaId, number>> = { 'purple-edition': 0, 'gradient-experience': 0, 'product-spotlight': 0, 'luxury-minimal': 0 };

/** Layout de una plantilla para un formato: el 4:5 es la disposicion propia de la plantilla; 1x1 y 9x16 salen de su familia. */
export function layoutDe(p: Plantilla, f: Formato): Layout {
  if (f === '4x5') return clon(D45[p.id]);
  const l = BASE[p.familia](f);
  if (CANTIDAD_LISTA[p.id] != null) l.lista.cantidad = CANTIDAD_LISTA[p.id]!;
  if (p.familia === 'centrado' && p.titulo.ancla === 'start') {
    // titulo a la izquierda y logo a la derecha (espejo del layout base)
    l.titulo.x = 60; l.titulo.ancla = 'start';
    l.logo.x = 1020; l.logo.ancla = 'end';
  }
  return l;
}