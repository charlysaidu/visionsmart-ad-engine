import type { DatosProducto } from './datos.ts';
import type { DatosPromo } from './promo.ts';

export type Formato = '4x5' | '1x1' | '9x16';
export const FORMATOS: Record<Formato, { ancho: number; alto: number }> = {
  '4x5': { ancho: 1080, alto: 1350 },
  '1x1': { ancho: 1080, alto: 1080 },
  '9x16': { ancho: 1080, alto: 1920 },
};

export type PlantillaId =
  | 'black-premium' | 'pure-white' | 'blue-signature' | 'purple-edition' | 'gradient-experience'
  | 'product-spotlight' | 'tech-editorial' | 'modern-glass' | 'dynamic-tech' | 'luxury-minimal';

/** Como se muestra el precio: en bolivares, en dolares o sin precio. (Aplica a todo un lote y tambien a una imagen individual.) */
export type ModoPrecio = 'bs' | 'usd' | 'ninguno';

export type Fuente = { regular: string; bold: string; extrabold: string };
export const FUENTE_JAKARTA: Fuente = { regular: 'Jakarta-Regular', bold: 'Jakarta-Bold', extrabold: 'Jakarta-ExtraBold' };

export type ContextoAnuncio = {
  producto: DatosProducto;
  /** Bolivares por dolar (la que use el sistema). null/0 = no disponible. */
  tasaBs: number | null;
  /** Por defecto 'bs'. */
  precio?: ModoPrecio;
  /** Texto superior del precio (por defecto "PRECIO"). */
  etiquetaPrecio?: string | null;
  /** Modo promocion (precio anterior tachado, % de descuento, unidades limitadas, vigencia). */
  promo?: DatosPromo | null;
  marca?: { web?: string; redes?: string };
  fuente?: Fuente;
};

// ── Configuracion declarativa de una plantilla (JSON puro) ─────────────────────
export type Parada = [offset: number, color: string, opacidad?: number];
/** Degradado lineal; angulo en grados: 0 = izquierda->derecha, 90 = arriba->abajo. */
export type Grad = { paradas: Parada[]; angulo?: number };

export type Familia = 'clasico' | 'centrado' | 'editorial';

export type Plantilla = {
  id: PlantillaId;
  nombre: string;
  familia: Familia;
  fondo: Grad;
  texto: string;
  textoSec: string;
  /** Colores del degradado de acento (izq->der): linea 2 del titulo, trazos, etc. */
  acento: string[];
  titulo: { ancla: 'start' | 'end'; peso?: 'bold' };       // peso: por defecto ExtraBold
  icono: { estilo: 'circulo' | 'linea'; color: string; relleno: string; borde: string };
  precio: { color: string[]; desde: string; vidrio?: boolean };
  garantia: { estilo: 'borde' | 'relleno'; borde: string; relleno: string; texto: string; textoSec: string; degradado?: string[] };
  podio: { tipo: 'disco' | 'cilindro' | 'ninguno'; tapa: string[]; cuerpo: string[]; borde: string; brillo: string };
  halo?: { color: string; opacidad: number };
  adornos: string[];
  logo: 'claro' | 'oscuro';
  pie: string;
};

// ── Zonas de un layout ──────────────────────────────────────────────────────────
export type Ancla = 'start' | 'middle' | 'end';
export type Layout = {
  logo: { x: number; y: number; h: number; ancla: Ancla };
  titulo: { x: number; y: number; ancho: number; ancla: Ancla; tamMax: number; tamMin: number };
  lista: { x: number; y: number; ancho: number; modo: 'columna' | 'fila'; paso: number; cantidad: number; tam: number; icono: number };
  foto: { x: number; y: number; w: number; h: number };
  podio: { cx: number; cy: number; rx: number; ry: number; alto: number };
  precio: { x: number; y: number; ancho: number; ancla: Ancla; tam: number };
  garantia: { x: number; y: number; w: number; h: number };
  pie: { x: number; y: number; ancla: Ancla };
};