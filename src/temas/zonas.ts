/**
 * ZONAS PROTEGIDAS de una plantilla: donde NUNCA se dibuja una decoracion. Salen del layout (por familia y formato), asi que valen para las 10 plantillas.
 * Son conservadoras: cubren el espacio maximo que pueden ocupar el texto y el precio (hasta 3 lineas de titulo, etiqueta + precio anterior apilados, etc.).
 */
import type { Dibujo } from '../primitivas.ts';
import { medir } from '../util.ts';
import type { Caja, ZonaProtegida } from './_base.ts';

export function zonasProtegidas(d: Dibujo, conPromo = true): ZonaProtegida[] {
  const { W, H, lay: L, p } = d;
  const z: ZonaProtegida[] = [];
  const add = (nombre: string, c: Caja) => z.push({ nombre, caja: { x: Math.max(0, c.x), y: Math.max(0, c.y), w: c.w, h: c.h } });

  // logo: simbolo + «VISIONSMART»
  const lg = L.logo, tamLogo = lg.h * 0.62, ancho = lg.h + lg.h * 0.22 + medir('VISIONSMART', 'extrabold', tamLogo, tamLogo * 0.06);
  const x0 = lg.ancla === 'end' ? lg.x - ancho : lg.ancla === 'middle' ? lg.x - ancho / 2 : lg.x;
  add('logo', { x: x0 - 6, y: lg.y - 6, w: ancho + 12, h: lg.h + 12 });

  // titulo (hasta 3 lineas)
  const t = L.titulo;
  add('titulo', { x: t.ancla === 'end' ? t.x - t.ancho : t.ancla === 'middle' ? t.x - t.ancho / 2 : t.x, y: t.y - t.tamMax * 0.9, w: t.ancho, h: t.tamMax * 0.9 + t.tamMax * 1.06 * 2 + t.tamMax * 0.35 });

  // lista de caracteristicas
  const li = L.lista;
  add('lista', li.modo === 'fila' ? { x: li.x, y: li.y - 4, w: li.ancho, h: li.icono + 60 } : { x: li.x, y: li.y - 4, w: li.ancho, h: li.paso * (li.cantidad - 1) + li.icono + 60 });

  // PRODUCTO: toda la zona de la foto + el podio (que se dibuja detras y debajo de ella)
  add('producto', L.foto);
  const po = L.podio;
  if (p.podio.tipo === 'ninguno') add('sombra', { x: L.foto.x + L.foto.w * 0.1, y: L.foto.y + L.foto.h - 20, w: L.foto.w * 0.8, h: 70 });
  else {
    const alto = p.podio.tipo === 'cilindro' ? po.alto * 2.6 : po.alto;
    add('podio', { x: po.cx - po.rx * 1.14, y: po.cy - po.ry - 4, w: po.rx * 2.28, h: alto + po.ry * 2.4 + 10 });
  }

  // PRECIO: etiqueta + precio anterior apilados + precio (y el recuadro de vidrio si lo hay)
  const pr = L.precio, anchoPr = pr.ancho + 56;
  add('precio', { x: (pr.ancla === 'end' ? pr.x - pr.ancho : pr.ancla === 'middle' ? pr.x - pr.ancho / 2 : pr.x) - 32, y: pr.y - pr.tam * 1.05 - 120, w: anchoPr, h: pr.tam * 1.05 + 120 + 28 });

  add('garantia', { x: L.garantia.x - 4, y: L.garantia.y - 4, w: L.garantia.w + 8, h: L.garantia.h + 8 });

  // pie (y la linea de vigencia que lo acompana en promocion)
  const pi = L.pie, extra = conPromo ? 64 : 0;
  // ancho REAL del texto del pie (y de la linea de vigencia, que es mas ancha), con holgura: asi quedan libres las esquinas inferiores
  const tamPie = Math.round(d.W * (p.familia === 'editorial' ? 0.022 : 0.026)), wPie = Math.max(medir('visionsmart.app  ·  @visionsmart.app', 'regular', tamPie, 1.5) + 40, conPromo ? medir('OFERTA VÁLIDA HASTA EL 31/12/2026', 'bold', tamPie, 1) + 40 : 0);
  add('pie', { x: pi.ancla === 'middle' ? pi.x - wPie / 2 : pi.ancla === 'end' ? pi.x - wPie : pi.x, y: pi.y - 38 - extra, w: wPie, h: 56 + extra });
  void W; void H;
  return z;
}