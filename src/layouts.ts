import type { Familia, Formato, Layout, Plantilla } from './tipos.ts';

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

/** Layout de una plantilla para un formato: la familia define las zonas; la plantilla puede espejar titulo/logo. */
export function layoutDe(p: Plantilla, f: Formato): Layout {
  const l = BASE[p.familia](f);
  if (p.familia === 'centrado' && p.titulo.ancla === 'start') {
    // titulo a la izquierda y logo a la derecha (espejo del layout base)
    l.titulo.x = 60; l.titulo.ancla = 'start';
    l.logo.x = 1020; l.logo.ancla = 'end';
  }
  return l;
}