import type { TemaCtx } from './temas/_base.ts';
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
  | 'product-spotlight' | 'tech-editorial' | 'modern-glass' | 'dynamic-tech' | 'luxury-minimal'
  // Coleccion 02 (motor 1.1.0)
  | 'neon-edge' | 'clean-hex' | 'cosmic-flow' | 'minimal-stripes' | 'black-grid' | 'pearl-wave' | 'dual-tone' | 'info-box' | 'vision-frame' | 'diagonal-split';

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
  /** Solo LUXURY MINIMAL: fondo 'claro' (blanco perla) u 'oscuro' (negro). Sin indicar: lo sugiere el producto (varianteSugerida). */
  variante?: 'claro' | 'oscuro';
  /** Tema visual (capa decorativa sobre la plantilla). null / ausente = sin tema (salida identica a la de siempre). */
  tema?: TemaCtx | null;
  marca?: { web?: string; redes?: string };
  fuente?: Fuente;
};

// ── Configuracion declarativa de una plantilla (JSON puro) ─────────────────────
export type Parada = [offset: number, color: string, opacidad?: number];
/** Degradado lineal; angulo en grados: 0 = izquierda->derecha, 90 = arriba->abajo. */
export type Grad = { paradas: Parada[]; angulo?: number };

/** Familia de composicion para los formatos 1x1 y 9x16 (el 4x5 tiene una disposicion propia por plantilla). */
export type Familia = 'clasico' | 'centrado' | 'editorial';

/** Referencia de posicion de una capa decorativa: el lienzo completo o la caja de la foto del producto (x, y en 0..1 de esa caja). */
export type RefCapa = 'lienzo' | 'foto';
/** Zonas del layout a las que se puede ajustar un panel de cristal. */
export type RefPanel = 'foto' | 'lista' | 'precio' | 'titulo' | 'garantia' | 'lienzo';

/**
 * `solo: '4x5'` = la capa existe solo en el formato 4:5; `solo: 'otros'` = solo en 1x1 y 9x16 (las demas capas valen en los 3 formatos).
 * CAPAS DECORATIVAS (JSON puro): lo que da personalidad a cada plantilla. Se dibujan en orden, detras del producto.
 * Las coordenadas son fracciones (0..1) del lienzo o de la caja de la foto (segun `ref`), asi valen en los 3 formatos.
 * Todo se dibuja con degradados y formas simples (sin filtros, mascaras ni recortes), compatible con react-native-svg.
 */
export type Capa = { solo?: '4x5' | 'otros' } & (
  /** Luz ambiental: elipse con degradado radial (centro -> transparente). rx/ry en fraccion del ancho/alto de la referencia. */
  | { t: 'luz'; ref?: RefCapa; x: number; y: number; rx: number; ry?: number; color: string; op: number }
  /** Cuatro esquinas (corchetes finos) con degradado de marca, alrededor de la referencia. */
  | { t: 'marco'; ref?: RefCapa; color: string[]; op: number; inset: number; largo: number; grosor?: number }
  /** Linea fina con degradado que se desvanece en los extremos. */
  | { t: 'linea'; ref?: RefCapa; x1: number; y1: number; x2: number; y2: number; color: string[]; op: number; grosor?: number }
  /** Banda diagonal (paralelogramo con degradado a lo largo). `largo` y `grosor` en px del formato 4x5 (se escalan con el ancho). */
  | { t: 'banda'; x: number; y: number; largo: number; grosor: number; angulo: number; color: string[]; op: number }
  /** Aro (elipse con trazo): `r` es fraccion del ancho del lienzo. */
  | { t: 'aro'; ref?: RefCapa; x: number; y: number; r: number; ry?: number; color: string[]; op: number; grosor?: number }
  /** Disco relleno con degradado radial (forma de luz). */
  | { t: 'disco'; ref?: RefCapa; x: number; y: number; r: number; color: string; op: number; opBorde?: number }
  /** Poligono (puntos en fracciones del lienzo) con relleno y trazo opcionales. */
  | { t: 'poli'; pts: [number, number][]; relleno: string; op: number; trazo?: string; opTrazo?: number; grosor?: number }
  /** Malla de puntos pequenos. */
  | { t: 'puntos'; x: number; y: number; cols: number; filas: number; paso: number; color: string; op: number; r?: number }
  /** Panel de cristal (superficie translucida con borde de degradado y reflejo suave), ajustado a una zona del layout. */
  | { t: 'panel'; ref: RefPanel; pad: number; rx: number; relleno: string; opRelleno: number; borde: string[]; opBorde: number; brillo?: number }
  /** Elipse de piso: el aro luminoso bajo el producto (la plataforma ligera del estudio). */
  | { t: 'piso'; ancho: number; alto: number; color: string[]; op: number; grosor?: number }
  /** Onda: curva senoidal a lo ancho (y, amp en fraccion del alto; largo = longitud de onda en fraccion del ancho; fase en vueltas). Con `relleno` se tine el area hacia abajo o arriba con un degradado que se desvanece. */
  | { t: 'onda'; y: number; amp: number; largo: number; fase?: number; color: string[]; op: number; grosor?: number; relleno?: 'abajo' | 'arriba'; opRelleno?: number }
  /** Rejilla fina de lineas (cuadricula) dentro de un rectangulo en fracciones del lienzo; `paso` en px del 4x5. */
  | { t: 'rejilla'; x0: number; y0: number; x1: number; y1: number; paso: number; color: string; op: number; grosor?: number }
  /** Hexagono regular (r = fraccion del ancho de la referencia; rot en grados): contorno con degradado y/o relleno translucido. */
  | { t: 'hex'; ref?: RefCapa; x: number; y: number; r: number; rot?: number; trazo?: string[]; opTrazo?: number; grosor?: number; relleno?: string; opRelleno?: number }
  /** Marco fino luminoso con degradado (rectangulo redondeado a `inset` px de cada borde; `hasta` = y donde termina por abajo) + resplandor suave. */
  | { t: 'borde'; inset: number; rx: number; color: string[]; op: number; grosor?: number; hasta?: number }
);

export type Plantilla = {
  id: PlantillaId;
  nombre: string;
  /** Numero (1..20) y coleccion (1 = plantillas 1-10, 2 = plantillas 11-20) con que se presenta en los selectores. */
  numero: number;
  coleccion: 1 | 2;
  /** Frase corta para la tarjeta del selector. */
  descripcion: string;
  familia: Familia;
  fondo: Grad;
  texto: string;
  textoSec: string;
  /** Colores del degradado de acento (izq->der): linea 2 del titulo, trazos, etc. */
  acento: string[];
  titulo: { ancla: 'start' | 'end'; peso?: 'bold' };       // peso: por defecto ExtraBold
  icono: { estilo: 'circulo' | 'linea'; color: string; relleno: string; borde: string };
  /** `acento`: filete con el degradado de marca bajo el precio (detalle). */
  precio: { color: string[]; desde: string; vidrio?: boolean; acento?: string[] };
  /** estilo 'boton': pildora con degradado de marca (la garantia como boton). */
  garantia: { estilo: 'borde' | 'relleno' | 'boton'; borde: string; relleno: string; texto: string; textoSec: string; degradado?: string[] };
  podio: { tipo: 'disco' | 'cilindro' | 'ninguno'; tapa: string[]; cuerpo: string[]; borde: string; brillo: string; bordeDegradado?: string[]; sombra?: string };
  halo?: { color: string; opacidad: number };
  adornos: string[];
  /** Capas decorativas propias de la plantilla (ver `Capa`). */
  capas?: Capa[];
  /** Opciones de la foto del producto: inclinacion (grados), reflejo en el piso (opacidad 0..1, solo con fondo vertical) y sombra de contacto. */
  foto?: { rot?: number; reflejo?: number; sombra?: 'natural' | 'estudio' | 'ninguna' };
  /** Chip del descuento (-N%). Por defecto: degradado de acento con texto blanco. `lado`: esquina de la foto donde va. */
  chip?: { relleno: string[]; texto: string; lado?: 'izq' | 'der' };
  /** Colores de texto distintos de `texto` para composiciones mixtas (p. ej. titulo blanco sobre un bloque negro con el resto sobre blanco perla). */
  colores?: { titulo?: string; lista?: string; vigencia?: string; tachado?: string };
  /** Colores del fondo REAL sobre el que va el titulo (si no es el fondo general); lo usa la prueba de contraste. */
  superficies?: { titulo?: string[]; precio?: string[] };
  /** Color del texto de las tarjetas de caracteristicas y relleno de la tarjeta (modo 'bloque' del layout). */
  tarjeta?: { relleno: string; borde: string; opRelleno?: number };
  logo: 'claro' | 'oscuro' | 'pildora';
  pie: string;
};
// ── Zonas de un layout ──────────────────────────────────────────────────────────
export type Ancla = 'start' | 'middle' | 'end';
export type Layout = {
  logo: { x: number; y: number; h: number; ancla: Ancla };
  titulo: { x: number; y: number; ancho: number; ancla: Ancla; tamMax: number; tamMin: number };
  lista: { x: number; y: number; ancho: number; modo: 'columna' | 'fila' | 'rejilla'; paso: number; cantidad: number; tam: number; icono: number; /** solo caracteristicas sacadas de los datos reales del producto (sin frases de relleno ni por categoria) */ soloReales?: boolean; /** alto de cada fila en modo 'rejilla' (2 columnas) */ pasoY?: number; /** tarjetas (bloques) en lugar de lineas sueltas */ bloque?: boolean };
  foto: { x: number; y: number; w: number; h: number };
  podio: { cx: number; cy: number; rx: number; ry: number; alto: number };
  precio: { x: number; y: number; ancho: number; ancla: Ancla; tam: number };
  garantia: { x: number; y: number; w: number; h: number };
  pie: { x: number; y: number; ancla: Ancla };
};