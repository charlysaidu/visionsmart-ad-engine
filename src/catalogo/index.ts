/** Modulo CATALOGO del motor (v0.8.0): geometria unica de pagina + portada / cabecera / pie en SVG. Ver geometria.ts y render.ts para unidades y tamaños. */
export { paginaDe, pxDePt, PAGINA_PT, ASPECTO_IMAGEN, DPI_SVG, type PaginaGeo, type TamanoPagina, type PorPagina, type Rect } from './geometria.ts';
export {
  renderPortada, renderCabecera, renderPie, pieEnlaces, portadaZonas, cabeceraZonas, pieZonas, COLORES_CATALOGO, TEXTO_SITIO, TEXTO_INSTAGRAM, URL_SITIO, URL_INSTAGRAM,
  type DatosPortada, type DatosCabecera, type DatosPie,
} from './render.ts';
export { capaTemaCatalogo, type CapaCatalogo } from './tema.ts';