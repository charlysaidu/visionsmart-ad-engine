/**
 * Biblioteca SVG de elementos navideños: PRIMITIVAS vectoriales (path, circle, rect, polygon, ellipse, line). Sin PNG, sin IA, sin filtros, sin fuentes.
 * Cada funcion dibuja en una caja local (0,0)-(w,h) y devuelve el fragmento SVG; quien coloca el elemento lo traslada / escala / rota.
 */
import { n } from '../../util.ts';

export const ROJO = '#A60A2E', VERDE = '#0B4D2E', VERDE_CLARO = '#1A7A47', ORO = '#D4AF37', ORO_CLARO = '#F3DC8A', BLANCO = '#FFFFFF', AZUL_OSCURO = '#12285A', MARRON = '#5B3A1E';
export type Rng = () => number;
export type ColorRegalo = 'rojo' | 'blanco' | 'azul' | 'dorado' | 'verde';

const REGALOS: Record<ColorRegalo, { cuerpo: string; cinta: string; borde: string }> = {
  rojo: { cuerpo: ROJO, cinta: ORO, borde: '#7C0722' }, blanco: { cuerpo: '#F4F6FA', cinta: ROJO, borde: '#C5CFE0' }, azul: { cuerpo: AZUL_OSCURO, cinta: ORO, borde: '#0A1838' },
  dorado: { cuerpo: ORO, cinta: ROJO, borde: '#A8872A' }, verde: { cuerpo: VERDE, cinta: ORO, borde: '#073620' },
};

export function regalo(w: number, h: number, color: ColorRegalo): string {
  const c = REGALOS[color];
  return `<ellipse cx="${n(w / 2)}" cy="${n(h - 2)}" rx="${n(w * 0.46)}" ry="${n(h * 0.05)}" fill="#000000" fill-opacity="0.18"/>` +
    `<rect x="${n(w * 0.06)}" y="${n(h * 0.4)}" width="${n(w * 0.88)}" height="${n(h * 0.58)}" rx="3" fill="${c.cuerpo}" stroke="${c.borde}" stroke-width="1.5"/>` +
    `<rect x="${n(w * 0.02)}" y="${n(h * 0.28)}" width="${n(w * 0.96)}" height="${n(h * 0.17)}" rx="3" fill="${c.cuerpo}" stroke="${c.borde}" stroke-width="1.5"/>` +
    `<rect x="${n(w * 0.06)}" y="${n(h * 0.4)}" width="${n(w * 0.88)}" height="${n(h * 0.1)}" rx="2" fill="#FFFFFF" fill-opacity="0.1"/>` +
    `<rect x="${n(w * 0.43)}" y="${n(h * 0.28)}" width="${n(w * 0.14)}" height="${n(h * 0.7)}" fill="${c.cinta}"/>` +
    `<ellipse cx="${n(w * 0.36)}" cy="${n(h * 0.2)}" rx="${n(w * 0.15)}" ry="${n(h * 0.09)}" transform="rotate(-25 ${n(w * 0.36)} ${n(h * 0.2)})" fill="${c.cinta}" stroke="${c.borde}" stroke-width="1"/>` +
    `<ellipse cx="${n(w * 0.64)}" cy="${n(h * 0.2)}" rx="${n(w * 0.15)}" ry="${n(h * 0.09)}" transform="rotate(25 ${n(w * 0.64)} ${n(h * 0.2)})" fill="${c.cinta}" stroke="${c.borde}" stroke-width="1"/>` +
    `<circle cx="${n(w / 2)}" cy="${n(h * 0.24)}" r="${n(w * 0.06)}" fill="${c.cinta}" stroke="${c.borde}" stroke-width="1"/>`;
}

/** Rama de pino que sale de la esquina izquierda-arriba de su caja hacia la derecha-abajo, con luces doradas sutiles. */
export function ramaPino(w: number, h: number, rng: Rng, oscuro: boolean): string {
  const verdes = oscuro ? [VERDE_CLARO, '#12603A', '#23895A'] : [VERDE, '#12603A', '#0E5A34'];
  const p = (t: number) => { const mt = 1 - t, x0 = 0, y0 = h * 0.12, cx = w * 0.5, cy = h * 0.06, x1 = w * 0.98, y1 = h * 0.7; return { x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1, y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1 }; };
  let out = `<path d="M0 ${n(h * 0.12)} Q ${n(w * 0.5)} ${n(h * 0.06)} ${n(w * 0.98)} ${n(h * 0.7)}" fill="none" stroke="${MARRON}" stroke-width="4" stroke-linecap="round"/>`;
  const tufts = Math.max(8, Math.round(w / 16));
  for (let i = 1; i <= tufts; i++) {
    const t = i / (tufts + 0.5), q = p(t), largo = h * (0.34 - 0.16 * t) * (0.85 + rng() * 0.3);
    for (const lado of [-1, 1]) {
      for (const ang of [38, 62]) {
        const a = ((lado * ang + 18) * Math.PI) / 180, x2 = q.x + Math.cos(a - Math.PI / 2 + (lado > 0 ? Math.PI : 0)) * largo * (ang === 38 ? 1 : 0.7), y2 = q.y + Math.sin(a - Math.PI / 2 + (lado > 0 ? Math.PI : 0)) * largo * (ang === 38 ? 1 : 0.7);
        out += `<line x1="${n(q.x)}" y1="${n(q.y)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${verdes[Math.floor(rng() * verdes.length)]}" stroke-width="3.4" stroke-linecap="round"/>`;
      }
    }
  }
  for (let i = 0; i < Math.max(3, Math.round(w / 70)); i++) {
    const q = p(0.12 + rng() * 0.8), r = 3 + rng() * 1.5;
    out += `<circle cx="${n(q.x)}" cy="${n(q.y + h * 0.1)}" r="${n(r * 2.6)}" fill="${ORO_CLARO}" fill-opacity="0.2"/><circle cx="${n(q.x)}" cy="${n(q.y + h * 0.1)}" r="${n(r)}" fill="${ORO}"/>`;
  }
  return out;
}

/** Arbol minimalista (silueta de tres niveles con estrella). */
export function arbol(w: number, h: number, oscuro: boolean): string {
  const v = oscuro ? VERDE_CLARO : VERDE, v2 = oscuro ? '#23895A' : '#12603A';
  const nivel = (y0: number, y1: number, ancho: number, c: string) => `<polygon points="${n(w / 2)},${n(y0)} ${n(w / 2 + ancho / 2)},${n(y1)} ${n(w / 2 - ancho / 2)},${n(y1)}" fill="${c}"/>`;
  return `<rect x="${n(w * 0.45)}" y="${n(h * 0.86)}" width="${n(w * 0.1)}" height="${n(h * 0.14)}" fill="${MARRON}"/>` +
    nivel(h * 0.1, h * 0.52, w * 0.62, v2) + nivel(h * 0.28, h * 0.72, w * 0.8, v) + nivel(h * 0.46, h * 0.9, w, v2) +
    `<polygon points="${n(w / 2)},${n(h * 0.1)} ${n(w * 0.57)},${n(h * 0.2)} ${n(w * 0.43)},${n(h * 0.2)}" fill="#FFFFFF" fill-opacity="0.35"/>` +
    estrellaDorada(w / 2, h * 0.06, w * 0.13) +
    [[0.4, 0.4], [0.58, 0.55], [0.34, 0.66], [0.66, 0.74], [0.48, 0.8]].map(([a, b]) => `<circle cx="${n(w * a)}" cy="${n(h * b)}" r="${n(Math.max(2, w * 0.03))}" fill="${ORO}"/>`).join('');
}

function estrellaDorada(cx: number, cy: number, r: number): string {
  const k = r * 0.38;
  return `<polygon points="${n(cx)},${n(cy - r)} ${n(cx + k)},${n(cy - k)} ${n(cx + r)},${n(cy)} ${n(cx + k)},${n(cy + k)} ${n(cx)},${n(cy + r)} ${n(cx - k)},${n(cy + k)} ${n(cx - r)},${n(cy)} ${n(cx - k)},${n(cy - k)}" fill="${ORO}"/>`;
}

/** Muñeco de nieve minimalista (dos esferas, bufanda, nariz, ojos y botones). */
export function muneco(w: number, h: number): string {
  const rA = h * 0.19, rB = h * 0.29, cxx = w / 2, cA = h * 0.22, cB = h * 0.69;
  const borde = '#BFCCE2';
  return `<ellipse cx="${n(cxx)}" cy="${n(h - 2)}" rx="${n(rB * 1.05)}" ry="${n(h * 0.03)}" fill="#000000" fill-opacity="0.15"/>` +
    `<circle cx="${n(cxx)}" cy="${n(cB)}" r="${n(rB)}" fill="#F7FAFF" stroke="${borde}" stroke-width="1.5"/>` +
    `<circle cx="${n(cxx)}" cy="${n(cA)}" r="${n(rA)}" fill="#FFFFFF" stroke="${borde}" stroke-width="1.5"/>` +
    `<circle cx="${n(cxx - rA * 0.36)}" cy="${n(cA - rA * 0.12)}" r="${n(Math.max(1.8, rA * 0.09))}" fill="#1B2438"/><circle cx="${n(cxx + rA * 0.36)}" cy="${n(cA - rA * 0.12)}" r="${n(Math.max(1.8, rA * 0.09))}" fill="#1B2438"/>` +
    `<polygon points="${n(cxx)},${n(cA + rA * 0.02)} ${n(cxx + rA * 0.7)},${n(cA + rA * 0.14)} ${n(cxx)},${n(cA + rA * 0.26)}" fill="#E07A1F"/>` +
    `<rect x="${n(cxx - rA * 0.95)}" y="${n(cA + rA * 0.78)}" width="${n(rA * 1.9)}" height="${n(rA * 0.34)}" rx="${n(rA * 0.17)}" fill="${ROJO}"/>` +
    `<rect x="${n(cxx + rA * 0.35)}" y="${n(cA + rA * 0.95)}" width="${n(rA * 0.34)}" height="${n(rA * 0.95)}" rx="${n(rA * 0.1)}" fill="${ROJO}"/>` +
    [0.52, 0.72, 0.92].map((f) => `<circle cx="${n(cxx)}" cy="${n(h * f)}" r="${n(Math.max(2, rB * 0.07))}" fill="#1B2438"/>`).join('');
}

/** Calcetin navideño colgante (caja 100×120 escalada). */
export function calcetin(w: number, h: number): string {
  return `<g transform="scale(${n(w / 100)} ${n(h / 120)})">` +
    `<path d="M22 12 H62 V70 Q62 84 84 90 Q98 94 98 106 Q98 116 86 116 H34 Q16 116 16 96 V30 Q16 18 22 12 Z" fill="${ROJO}" stroke="#7C0722" stroke-width="2"/>` +
    `<rect x="14" y="0" width="52" height="20" rx="6" fill="#FFFFFF" stroke="#D4DCEA" stroke-width="1.5"/>` +
    `<path d="M62 92 Q86 96 98 106 Q98 116 86 116 H66 Z" fill="#FFFFFF" fill-opacity="0.92"/><path d="M16 84 Q16 116 34 116 H44 Q26 106 26 84 Z" fill="#FFFFFF" fill-opacity="0.92"/>` +
    `<circle cx="36" cy="48" r="3.2" fill="${ORO}"/><circle cx="50" cy="62" r="3.2" fill="${ORO}"/><circle cx="34" cy="72" r="3.2" fill="#FFFFFF"/></g>`;
}

/** Sombrero de Santa (caja 100×80 escalada). */
export function sombreroSanta(w: number, h: number): string {
  return `<g transform="scale(${n(w / 100)} ${n(h / 80)})">` +
    `<path d="M8 60 Q14 14 56 8 Q82 6 90 34 Q94 46 96 60 Z" fill="${ROJO}" stroke="#7C0722" stroke-width="2"/>` +
    `<path d="M14 52 Q30 24 62 22 Q40 34 30 56 Z" fill="#FFFFFF" fill-opacity="0.12"/>` +
    `<rect x="2" y="54" width="96" height="22" rx="11" fill="#FFFFFF" stroke="#D4DCEA" stroke-width="1.5"/>` +
    `<circle cx="90" cy="30" r="9.5" fill="#FFFFFF" stroke="#D4DCEA" stroke-width="1.5"/></g>`;
}

/** Montículo de nieve que se apoya en el borde inferior de su caja. */
export function monticulo(w: number, h: number, oscuro: boolean): string {
  const c = oscuro ? '#F4F8FF' : '#E8EFFA', borde = oscuro ? '#FFFFFF' : '#C9D6EA';
  return `<path d="M0 ${n(h)} L0 ${n(h * 0.62)} C${n(w * 0.12)} ${n(h * 0.2)} ${n(w * 0.3)} ${n(h * 0.06)} ${n(w * 0.5)} ${n(h * 0.36)} S${n(w * 0.86)} ${n(h * 0.1)} ${n(w)} ${n(h * 0.56)} L${n(w)} ${n(h)} Z" fill="${c}" fill-opacity="${oscuro ? '0.95' : '0.9'}" stroke="${borde}" stroke-width="1.5"/>` +
    `<path d="M${n(w * 0.1)} ${n(h * 0.5)} C${n(w * 0.2)} ${n(h * 0.3)} ${n(w * 0.34)} ${n(h * 0.26)} ${n(w * 0.46)} ${n(h * 0.44)}" fill="none" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="3" stroke-linecap="round"/>`;
}

/** Guirnalda de luces con cable: festones a lo largo de `w`, con bombillas que cuelgan. */
export function luces(w: number, h: number, rng: Rng, oscuro: boolean): string {
  const colores = oscuro ? [ORO_CLARO, '#FFF3D6', '#E0264A', ORO_CLARO, '#7FB8FF'] : [ORO, '#E0264A', VERDE_CLARO, ORO, '#FFF3D6'];
  const festones = Math.max(2, Math.round(w / 150)), paso = w / festones, caida = Math.min(h - 22, 24);
  let cable = `M0 4`, bombillas = '';
  for (let i = 0; i < festones; i++) {
    const x0 = i * paso, x1 = (i + 1) * paso;
    cable += ` Q ${n((x0 + x1) / 2)} ${n(4 + caida * 2)} ${n(x1)} 4`;
    for (let k = 1; k <= 3; k++) {
      const t = k / 4, mt = 1 - t, bx = mt * mt * x0 + 2 * mt * t * ((x0 + x1) / 2) + t * t * x1, by = mt * mt * 4 + 2 * mt * t * (4 + caida * 2) + t * t * 4, c = colores[Math.floor(rng() * colores.length)];
      bombillas += `<rect x="${n(bx - 2.5)}" y="${n(by)}" width="5" height="5" rx="1" fill="#2A2F3C"/><circle cx="${n(bx)}" cy="${n(by + 12)}" r="13" fill="${c}" fill-opacity="0.2"/><ellipse cx="${n(bx)}" cy="${n(by + 11)}" rx="5.5" ry="7.5" fill="${c}"/><circle cx="${n(bx - 1.8)}" cy="${n(by + 8.5)}" r="1.6" fill="#FFFFFF" fill-opacity="0.75"/>`;
    }
  }
  return `<path d="${cable}" fill="none" stroke="#2A2F3C" stroke-width="2" stroke-linecap="round"/>${bombillas}`;
}

/** Destello de 4 puntas. */
export function destello(r: number, color: string): string {
  const k = r * 0.2;
  return `<polygon points="0,${n(-r)} ${n(k)},${n(-k)} ${n(r)},0 ${n(k)},${n(k)} 0,${n(r)} ${n(-k)},${n(k)} ${n(-r)},0 ${n(-k)},${n(-k)}" fill="${color}"/><circle cx="${n(r * 0.55)}" cy="${n(-r * 0.55)}" r="${n(Math.max(1, r * 0.1))}" fill="${color}" fill-opacity="0.8"/>`;
}