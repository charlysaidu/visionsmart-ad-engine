/**
 * GEOMETRIA UNICA del catalogo PDF: fuente de verdad de las medidas de cada pagina. Modulo PURO (sin dependencias, sin plataforma).
 * Sistema PC (PDFKit) la usa para colocar cabecera, imagen y pie; Finanzas la usara igual cuando genere en el telefono.
 *
 * UNIDADES: todo en PUNTOS (pt, 1 pt = 1/72 pulgada), con el origen ARRIBA-IZQUIERDA (como PDFKit y como SVG).
 *   · Carta 612 × 792 pt (8,5 × 11 in).   · A4 595,28 × 841,89 pt (210 × 297 mm; mismas cifras que PDFKit).
 *
 * 1 imagen por pagina (vertical):  cabecera 70 pt · imagen 520 × 650 (4:5, nunca deformada ni recortada) · pie 72 pt. En Carta suman 792 exactos;
 *   en A4 sobra espacio vertical y la imagen queda centrada en la zona entre cabecera y pie.
 * 2 por pagina (horizontal, lado a lado): cabecera 50 pt · dos imagenes 352 × 440 (4:5) separadas 24 pt · pie 56 pt; la pagina gira (ancho ↔ alto).
 */

export type TamanoPagina = 'carta' | 'a4';
export type PorPagina = 1 | 2;
export type Rect = { x: number; y: number; w: number; h: number };

export type PaginaGeo = {
  tamano: TamanoPagina;
  porPagina: PorPagina;
  orientacion: 'vertical' | 'horizontal';
  /** Ancho y alto de la pagina en pt (ya con la orientacion). */
  ancho: number;
  alto: number;
  cabecera: Rect;
  /** Una zona por imagen (1 o 2), de izquierda a derecha. Todas 4:5. */
  imagenes: Rect[];
  pie: Rect;
  /** Margen lateral que alinea cabecera y pie con el borde izquierdo / derecho de las imagenes. */
  margenX: number;
};

export const PAGINA_PT: Record<TamanoPagina, { ancho: number; alto: number }> = { carta: { ancho: 612, alto: 792 }, a4: { ancho: 595.28, alto: 841.89 } };
/** Relacion ancho/alto de toda imagen del catalogo (las del Generador en 4:5). */
export const ASPECTO_IMAGEN = 4 / 5;
/** Resolucion a la que se rasterizan los SVG de portada / cabecera / pie. */
export const DPI_SVG = 150;
/** pt -> px a 150 dpi (tamano entero del SVG rasterizado). */
export const pxDePt = (pt: number): number => Math.round((pt * DPI_SVG) / 72);

const r2 = (x: number) => Math.round(x * 100) / 100;

const VERTICAL = { cabecera: 70, pie: 72, imgW: 520, imgH: 650 } as const;
const HORIZONTAL = { cabecera: 50, pie: 56, imgW: 352, imgH: 440, hueco: 24 } as const;

export function paginaDe(tamano: TamanoPagina, porPagina: PorPagina = 1): PaginaGeo {
  const base = PAGINA_PT[tamano];
  if (!base) throw new Error(`Tamano de pagina desconocido: ${tamano}`);
  if (porPagina !== 1 && porPagina !== 2) throw new Error(`porPagina debe ser 1 o 2 (recibido ${porPagina})`);
  if (porPagina === 1) {
    const { ancho, alto } = base, z = VERTICAL, libre = alto - z.cabecera - z.pie;
    const x = r2((ancho - z.imgW) / 2), y = r2(z.cabecera + (libre - z.imgH) / 2);
    return {
      tamano, porPagina, orientacion: 'vertical', ancho, alto, margenX: x,
      cabecera: { x: 0, y: 0, w: ancho, h: z.cabecera },
      imagenes: [{ x, y, w: z.imgW, h: z.imgH }],
      pie: { x: 0, y: r2(alto - z.pie), w: ancho, h: z.pie },
    };
  }
  const ancho = base.alto, alto = base.ancho, z = HORIZONTAL, libre = alto - z.cabecera - z.pie;
  const total = 2 * z.imgW + z.hueco, x0 = r2((ancho - total) / 2), y = r2(z.cabecera + (libre - z.imgH) / 2);
  return {
    tamano, porPagina, orientacion: 'horizontal', ancho, alto, margenX: x0,
    cabecera: { x: 0, y: 0, w: ancho, h: z.cabecera },
    imagenes: [{ x: x0, y, w: z.imgW, h: z.imgH }, { x: r2(x0 + z.imgW + z.hueco), y, w: z.imgW, h: z.imgH }],
    pie: { x: 0, y: r2(alto - z.pie), w: ancho, h: z.pie },
  };
}