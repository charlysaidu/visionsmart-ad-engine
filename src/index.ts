/**
 * visionsmart-ad-engine — motor de composicion de imagenes publicitarias.
 *
 *   renderSvg(plantilla, contexto, formato) -> string (documento SVG completo y autocontenido)
 *
 * Es el CONTRATO compartido: Sistema PC (Electron), App Finanzas (react-native-svg) y, a futuro, App Cliente lo rasterizan cada uno a su manera.
 * Reglas del motor: TypeScript puro, sin dependencias, sin modulos nativos, sin APIs de plataforma (ni DOM ni Intl ni toLocaleString),
 * sin filtros blur ni emojis (se ven distinto en cada plataforma). Brillos = degradados radiales. Salida determinista: mismo contexto -> mismo SVG.
 */

export const VERSION_MOTOR = '0.0.1-spike';

export type Formato = '4x5' | '1x1' | '9x16';
export const FORMATOS: Record<Formato, { ancho: number; alto: number }> = {
  '4x5': { ancho: 1080, alto: 1350 },
  '1x1': { ancho: 1080, alto: 1080 },
  '9x16': { ancho: 1080, alto: 1920 },
};

export type PlantillaId = 'simple' | 'black-premium';

export type Fuente = { regular: string; bold: string; extrabold: string };
export const FUENTE_JAKARTA: Fuente = { regular: 'Jakarta-Regular', bold: 'Jakarta-Bold', extrabold: 'Jakarta-ExtraBold' };

export type ContextoAnuncio = {
  producto: {
    nombre: string;
    precioUsd: number | null;
    /** URL o data URI de la foto (idealmente PNG/WebP con fondo transparente). null = sin foto. */
    fotoHref?: string | null;
  };
  /** Bolivares por dolar (la que use el sistema: la mas alta entre paralelo y BCV). null/0 = no disponible. */
  tasaBs: number | null;
  marca?: { web?: string; redes?: string; logoHref?: string | null };
  fuente?: Fuente;
};

// ── Precio: mismas reglas que App Cliente (lib/precio.ts) ──────────────────────
const tasaValida = (t: unknown): t is number => typeof t === 'number' && Number.isFinite(t) && t > 0;

/** Bs redondeado al multiplo de 100 mas cercano. */
export const redondearBs = (bs: number): number => Math.round(bs / 100) * 100;

/** 20300 -> "20.300" (separador de miles con punto, sin depender de Intl). */
export const miles = (n: number): string => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** "Bs. 20.300" o null si no hay precio o tasa valida. */
export function textoBolivares(precioUsd: number | null | undefined, tasa: number | null | undefined): string | null {
  const usd = Number(precioUsd);
  if (!tasaValida(tasa) || !Number.isFinite(usd) || usd <= 0) return null;
  return `Bs. ${miles(redondearBs(usd * tasa))}`;
}

/** "$24.90" (siempre 2 decimales) o null. */
export function textoDolares(precioUsd: number | null | undefined): string | null {
  const usd = Number(precioUsd);
  if (!Number.isFinite(usd) || usd <= 0) return null;
  return `$${usd.toFixed(2)}`;
}

// ── Utilidades de texto ─────────────────────────────────────────────────────────
export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ANCHO_LETRA = 0.62; // ancho medio de una mayuscula Bold / tamano de letra (aproximado; la fase 1 trae metricas reales)

/** Parte el titulo en 1-2 lineas que quepan en `ancho`, bajando el tamano hasta `tamMin`; la 2.a linea se corta con "...". */
export function tituloEnLineas(nombre: string, ancho: number, tamMax: number, tamMin: number): { lineas: string[]; tam: number } {
  const palabras = nombre.trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return { lineas: [''], tam: tamMax };
  const caben = (s: string, tam: number) => s.length * ANCHO_LETRA * tam <= ancho;
  const una = palabras.join(' ');
  for (let tam = tamMax; tam >= tamMin; tam -= 2) if (caben(una, tam)) return { lineas: [una], tam };
  let mejor = { a: una, b: '', max: Infinity };
  for (let i = 1; i < palabras.length; i++) {
    const a = palabras.slice(0, i).join(' ');
    const b = palabras.slice(i).join(' ');
    const max = Math.max(a.length, b.length);
    if (max < mejor.max) mejor = { a, b, max };
  }
  for (let tam = tamMax; tam >= tamMin; tam -= 2) {
    if (caben(mejor.a, tam) && caben(mejor.b, tam)) return { lineas: [mejor.a, mejor.b], tam };
  }
  const corta = (s: string) => {
    if (caben(s, tamMin)) return s;
    const max = Math.max(1, Math.floor(ancho / (ANCHO_LETRA * tamMin)) - 1);
    return s.slice(0, max).trimEnd() + '...';
  };
  return { lineas: mejor.b ? [corta(mejor.a), corta(mejor.b)] : [corta(una)], tam: tamMin };
}

// ── Zonas por formato ───────────────────────────────────────────────────────────
type Zonas = { foto: { x: number; y: number; w: number; h: number }; tituloY: number; precioY: number; pieY: number };

function zonas(f: Formato): Zonas {
  const { ancho: W, alto: H } = FORMATOS[f];
  if (f === '1x1') return { foto: { x: 90, y: 150, w: W - 180, h: 520 }, tituloY: 740, precioY: 880, pieY: H - 70 };
  if (f === '9x16') return { foto: { x: 60, y: 330, w: W - 120, h: 840 }, tituloY: 1290, precioY: 1480, pieY: H - 110 };
  return { foto: { x: 70, y: 190, w: W - 140, h: 640 }, tituloY: 920, precioY: 1090, pieY: H - 80 };   // 4x5
}

// ── Plantillas ──────────────────────────────────────────────────────────────────
function cabecera(W: number, H: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
}

/** Plantilla de MEDICION: solo degradados y texto, sin foto. Sirve de base para medir el costo del render. */
function plantillaSimple(ctx: ContextoAnuncio, f: Formato): string {
  const { ancho: W, alto: H } = FORMATOS[f];
  const fu = ctx.fuente ?? FUENTE_JAKARTA;
  const bs = textoBolivares(ctx.producto.precioUsd, ctx.tasaBs);
  const { lineas, tam } = tituloEnLineas(ctx.producto.nombre, W - 160, 76, 48);
  return [
    cabecera(W, H),
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1E52"/><stop offset="1" stop-color="#25104F"/></linearGradient></defs>`,
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>`,
    ...lineas.map((l, i) => `<text x="${W / 2}" y="${H / 2 + i * tam * 1.15}" font-family="${fu.extrabold}" font-size="${tam}" fill="#FFFFFF" text-anchor="middle">${esc(l)}</text>`),
    bs ? `<text x="${W / 2}" y="${H / 2 + 200}" font-family="${fu.extrabold}" font-size="96" fill="#8FD0FF" text-anchor="middle">${esc(bs)}</text>` : '',
    `</svg>`,
  ].join('');
}

/** BLACK PREMIUM (version de spike: estructura real, adornos minimos). */
function plantillaBlackPremium(ctx: ContextoAnuncio, f: Formato): string {
  const { ancho: W, alto: H } = FORMATOS[f];
  const z = zonas(f);
  const fu = ctx.fuente ?? FUENTE_JAKARTA;
  const marca = { web: 'visionsmart.ve', redes: '@visionsmart.ve', ...(ctx.marca ?? {}) };
  const bs = textoBolivares(ctx.producto.precioUsd, ctx.tasaBs);
  const usd = textoDolares(ctx.producto.precioUsd);
  const { lineas, tam } = tituloEnLineas(ctx.producto.nombre, W - 160, 72, 44);
  const cx = W / 2;
  const tamBs = bs ? Math.min(150, Math.floor((W - 200) / (bs.length * 0.6))) : 0;
  const foto = ctx.producto.fotoHref
    ? `<image href="${esc(ctx.producto.fotoHref)}" x="${z.foto.x}" y="${z.foto.y}" width="${z.foto.w}" height="${z.foto.h}" preserveAspectRatio="xMidYMid meet"/>`
    : '';
  const fotoCy = z.foto.y + z.foto.h / 2;
  return [
    cabecera(W, H),
    '<defs>',
    '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050609"/><stop offset="0.55" stop-color="#0E1018"/><stop offset="1" stop-color="#050609"/></linearGradient>',
    '<radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#59C2FF" stop-opacity="0.38"/><stop offset="0.6" stop-color="#2F8FD0" stop-opacity="0.12"/><stop offset="1" stop-color="#2F8FD0" stop-opacity="0"/></radialGradient>',
    '<linearGradient id="acento" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5EC4FF"/><stop offset="0.5" stop-color="#8E7BFF"/><stop offset="1" stop-color="#C264F0"/></linearGradient>',
    '<linearGradient id="precio" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#8FD0FF"/></linearGradient>',
    '<radialGradient id="suelo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000000" stop-opacity="0.75"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>',
    '</defs>',
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>`,
    `<ellipse cx="${cx}" cy="${fotoCy}" rx="${W * 0.5}" ry="${z.foto.h * 0.62}" fill="url(#halo)"/>`,
    `<ellipse cx="${cx}" cy="${z.foto.y + z.foto.h - 6}" rx="${z.foto.w * 0.34}" ry="26" fill="url(#suelo)"/>`,
    foto,
    `<rect x="${cx - 70}" y="${z.tituloY - tam - 46}" width="140" height="6" rx="3" fill="url(#acento)"/>`,
    ...lineas.map((l, i) => `<text x="${cx}" y="${z.tituloY + i * tam * 1.15}" font-family="${fu.extrabold}" font-size="${tam}" fill="#FFFFFF" text-anchor="middle">${esc(l)}</text>`),
    bs ? `<text x="${cx}" y="${z.precioY + (lineas.length - 1) * tam * 0.4}" font-family="${fu.extrabold}" font-size="${tamBs}" fill="url(#precio)" text-anchor="middle">${esc(bs)}</text>` : '',
    usd ? `<text x="${cx}" y="${z.precioY + (lineas.length - 1) * tam * 0.4 + 62}" font-family="${fu.bold}" font-size="44" fill="#9AA6BF" text-anchor="middle">${esc(usd)}</text>` : '',
    ctx.marca?.logoHref ? `<image href="${esc(ctx.marca.logoHref)}" x="${cx - 260}" y="${z.pieY - 96}" width="520" height="62" preserveAspectRatio="xMidYMid meet"/>` : `<text x="${cx}" y="${z.pieY - 50}" font-family="${fu.extrabold}" font-size="40" letter-spacing="6" fill="#FFFFFF" text-anchor="middle">VISION SMART</text>`,
    `<text x="${cx}" y="${z.pieY}" font-family="${fu.regular}" font-size="28" letter-spacing="2" fill="#B8C9E6" text-anchor="middle">${esc(marca.web)}  ·  ${esc(marca.redes)}</text>`,
    '</svg>',
  ].join('');
}

export function renderSvg(plantilla: PlantillaId, ctx: ContextoAnuncio, formato: Formato): string {
  if (!FORMATOS[formato]) throw new Error(`Formato desconocido: ${formato}`);
  if (plantilla === 'simple') return plantillaSimple(ctx, formato);
  if (plantilla === 'black-premium') return plantillaBlackPremium(ctx, formato);
  throw new Error(`Plantilla desconocida: ${plantilla}`);
}