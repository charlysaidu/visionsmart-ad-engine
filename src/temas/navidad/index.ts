/**
 * Tema NAVIDAD VISIONSMART. Capa decorativa sobre cualquiera de las 10 plantillas: nieve, ramas de pino, regalos, luces, arboles, calcetines,
 * sombreros de Santa (en una etiqueta o una esquina, nunca sobre la foto), muñecos de nieve, monticulos y destellos.
 * Paleta: rojo #A60A2E, verde #0B4D2E, blanco, dorado #D4AF37 (mezclada con el azul / morado de Vision Smart de cada plantilla).
 *
 * Reglas por codigo: cada elemento se coloca con muestreo aleatorio (PRNG sembrado con producto + plantilla + semilla) y SOLO se acepta si su caja
 * no cruza ninguna zona protegida (producto, precio, logo, titulo, lista, garantia, pie) ni otro elemento. Si no cabe, se omite.
 */
import type { Dibujo } from '../../primitivas.ts';
import { esColorClaro } from '../../primitivas.ts';
import { n } from '../../util.ts';
import { dentroDelLienzo, elementoActivo, hashSemilla, intersecta, prngDe, type Caja, type CajaDecor, type CapaTema, type DefinicionTema, type ElementoTema, type Intensidad, type TemaCtx, type ZonaProtegida } from '../_base.ts';
import * as E from './elementos.ts';

export const ETIQUETAS_PROMO_NAVIDAD = ['OFERTA NAVIDEÑA', 'PRECIO ESPECIAL DE NAVIDAD', 'REGALA TECNOLOGÍA', 'PROMOCIÓN DE TEMPORADA'] as const;

type Tipo = 'regalo' | 'pino' | 'arbol' | 'muneco' | 'calcetin' | 'sombrero' | 'monte' | 'luces' | 'destello';
const FLAG: Record<Tipo, ElementoTema> = { regalo: 'regalos', pino: 'pino', arbol: 'arboles', muneco: 'munecos', calcetin: 'calcetines', sombrero: 'sombreros', monte: 'montes', luces: 'luces', destello: 'destellos' };
const MAX_POR_TIPO: Record<Tipo, number> = { regalo: 2, pino: 2, arbol: 2, muneco: 1, calcetin: 1, sombrero: 1, monte: 2, luces: 1, destello: 3 };
const PRIORIDAD: Record<Tipo, number> = { luces: 0, monte: 1, pino: 2, arbol: 3, muneco: 3, regalo: 4, calcetin: 5, sombrero: 6, destello: 7 };

type Perfil = { oscuro: boolean; regalos: E.ColorRegalo[]; pool: Partial<Record<Tipo, number>> };
/** Adaptacion por plantilla segun su fondo dominante. */
const PERFILES: Record<string, Perfil> = {
  'black-premium':       { oscuro: true,  regalos: ['rojo', 'rojo', 'dorado', 'blanco'], pool: { regalo: 3, pino: 3, luces: 3, monte: 2, arbol: 1, muneco: 1, calcetin: 1, sombrero: 1, destello: 2 } },
  'pure-white':          { oscuro: false, regalos: ['rojo', 'rojo', 'verde', 'dorado'],  pool: { regalo: 3, pino: 2, arbol: 3, monte: 2, muneco: 1, calcetin: 2, sombrero: 1, destello: 1, luces: 1 } },
  'luxury-minimal':      { oscuro: false, regalos: ['rojo', 'rojo', 'verde'],             pool: { regalo: 3, pino: 3, arbol: 2, monte: 1, luces: 1, destello: 1, calcetin: 1, sombrero: 1 } },
  'blue-signature':      { oscuro: true,  regalos: ['rojo', 'blanco', 'dorado'],          pool: { pino: 3, luces: 3, destello: 3, regalo: 2, monte: 2, arbol: 1, muneco: 1, sombrero: 1 } },
  'purple-edition':      { oscuro: true,  regalos: ['blanco', 'dorado', 'blanco'],        pool: { regalo: 3, destello: 3, monte: 2, luces: 1, arbol: 1, muneco: 1, sombrero: 1, pino: 1 } },
  'gradient-experience': { oscuro: false, regalos: ['dorado', 'dorado', 'rojo'],         pool: { destello: 3, regalo: 3, pino: 2, monte: 2, arbol: 1, luces: 1, calcetin: 1 } },
  'product-spotlight':   { oscuro: true,  regalos: ['rojo', 'dorado', 'blanco'],          pool: { luces: 3, pino: 2, regalo: 3, monte: 2, destello: 2, muneco: 1, arbol: 1 } },
  'tech-editorial':      { oscuro: false, regalos: ['rojo', 'rojo', 'dorado'],           pool: { regalo: 3, pino: 2, arbol: 2, monte: 1, calcetin: 2, destello: 1, muneco: 1 } },
  'modern-glass':        { oscuro: false, regalos: ['rojo', 'dorado', 'blanco'],          pool: { regalo: 3, destello: 3, pino: 2, arbol: 1, monte: 2, luces: 1 } },
  'dynamic-tech':        { oscuro: true,  regalos: ['rojo', 'dorado', 'blanco'],          pool: { luces: 3, regalo: 2, destello: 3, pino: 2, monte: 2, arbol: 1 } },
};

const CANTIDAD: Record<Intensidad, [number, number]> = { sutil: [2, 1], equilibrada: [4, 1], festiva: [6, 2] };        // [minimo, variacion extra 0..N]
const ESCALA: Record<Intensidad, number> = { sutil: 0.82, equilibrada: 1, festiva: 1.08 };
const NIEVE: Record<Intensidad, [number, number]> = { sutil: [16, 3], equilibrada: [30, 6], festiva: [46, 10] };         // [particulas, bokeh]

type Esq = 'tl' | 'tr' | 'bl' | 'br';

export function capaNavidad(d: Dibujo, tema: TemaCtx, zonas: ZonaProtegida[], plantillaId: string): CapaTema {
  const { W, H } = d, rng = prngDe(tema, plantillaId), inten: Intensidad = tema.intensidad ?? 'equilibrada';
  const perfil = PERFILES[plantillaId] ?? { oscuro: esColorClaro(d.p.texto), regalos: ['rojo', 'dorado'] as E.ColorRegalo[], pool: { regalo: 3, pino: 2, arbol: 2, monte: 2, destello: 2, luces: 1 } };
  const oscuro = esColorClaro(d.p.texto), esc = ESCALA[inten];
  const cajas: CajaDecor[] = [], partes: { prio: number; svg: string }[] = [];
  const prohibidas: Caja[] = zonas.map((z) => z.caja);
  const ocupadas: Caja[] = [];
  const entre = (a: number, b: number) => a + rng() * (b - a);
  const libre = (c: Caja, margen = 12, ignorar?: string): boolean =>
    dentroDelLienzo(c, W, H) && !zonas.some((z) => z.nombre !== ignorar && intersecta(c, z.caja, margen)) && !ocupadas.some((o) => intersecta(c, o, 8));
  const registrar = (tipo: string, c: Caja, svg: string, prio: number) => { cajas.push({ tipo, caja: c }); ocupadas.push(c); partes.push({ prio, svg }); };
  const rotada = (c: Caja, grados: number): Caja => { if (!grados) return c; const k = 0.1 + Math.abs(grados) / 90 * 0.4; return { x: c.x - c.w * k / 2, y: c.y - c.h * k / 2, w: c.w * (1 + k), h: c.h * (1 + k) }; };
  const g = (x: number, y: number, inner: string, rot = 0, w = 0, h = 0, extra = '') => `<g transform="translate(${n(x)} ${n(y)})${rot ? ` rotate(${n(rot)} ${n(w / 2)} ${n(h / 2)})` : ''}${extra}">${inner}</g>`;

  const esquina = (e: Esq, w: number, h: number, hold = 0): { x: number; y: number } => ({ x: e === 'tl' || e === 'bl' ? hold : W - w - hold, y: e === 'tl' || e === 'tr' ? hold : H - h - hold });
  const region = (w: number, h: number): { x: number; y: number } => {
    const r = rng();
    if (r < 0.34) return { x: entre(0, W - w), y: entre(H * 0.74, H - h) };            // franja inferior
    if (r < 0.54) return { x: entre(0, W - w), y: entre(0, H * 0.13) };                  // franja superior
    if (r < 0.77) return { x: entre(0, W * 0.07), y: entre(0, H - h) };                  // margen izquierdo
    return { x: entre(W * 0.93 - w, W - w), y: entre(0, H - h) };                        // margen derecho
  };
  const intentar = (w: number, h: number, rot: number, pos: () => { x: number; y: number }, ignorar?: string, margen = 12, veces = 80) => {
    for (let i = 0; i < veces; i++) { const p = pos(), c = rotada({ x: p.x, y: p.y, w, h }, rot); if (libre(c, margen, ignorar)) return { p, c }; }
    return null;
  };

  const colocar: Record<Tipo, () => boolean> = {
    regalo: () => {
      const w = Math.round(entre(84, 150) * esc), h = Math.round(w * 0.92), rot = Math.round(entre(-8, 8)), col = perfil.regalos[Math.floor(rng() * perfil.regalos.length)];
      const r = intentar(w, h, rot, () => region(w, h)); if (!r) return false;
      registrar('regalo', r.c, g(r.p.x, r.p.y, E.regalo(w, h, col), rot, w, h), PRIORIDAD.regalo); return true;
    },
    pino: () => {
      // la rama sale de un borde / esquina hacia el interior: se voltea segun el lado donde queda; si no cabe grande, se prueba mas corta
      const w0 = Math.round(entre(210, 340) * esc), h0 = Math.round(w0 * 0.46), esqs: Esq[] = ['tl', 'tr', 'bl', 'br'];
      for (const f of [1, 0.8, 0.62, 0.48]) {
        const ww = Math.round(w0 * f), hh = Math.round(h0 * f);
        const cand: { x: number; y: number }[] = esqs.map((e) => esquina(e, ww, hh, 0));
        for (let i = 0; i < 40; i++) cand.push(region(ww, hh));
        for (const pos of cand.sort(() => rng() - 0.5)) {
          const c = { x: pos.x, y: pos.y, w: ww, h: hh };
          if (!libre(c)) continue;
          const sx = pos.x + ww / 2 > W / 2 ? -1 : 1, sy = pos.y + hh / 2 > H / 2 ? -1 : 1, tx = sx < 0 ? pos.x + ww : pos.x, ty = sy < 0 ? pos.y + hh : pos.y;
          registrar('pino', c, `<g transform="translate(${n(tx)} ${n(ty)}) scale(${sx} ${sy})">${E.ramaPino(ww, hh, rng, oscuro)}</g>`, PRIORIDAD.pino); return true;
        }
      }
      return false;
    },    arbol: () => {
      const h = Math.round(entre(120, 200) * esc), w = Math.round(h * 0.64), r = intentar(w, h, 0, () => region(w, h)); if (!r) return false;
      registrar('arbol', r.c, g(r.p.x, r.p.y, E.arbol(w, h, oscuro)), PRIORIDAD.arbol); return true;
    },
    muneco: () => {
      const h = Math.round(entre(130, 190) * esc), w = Math.round(h * 0.64), r = intentar(w, h, 0, () => region(w, h)); if (!r) return false;
      registrar('muneco', r.c, g(r.p.x, r.p.y, E.muneco(w, h)), PRIORIDAD.muneco); return true;
    },
    calcetin: () => {
      const h = Math.round(entre(84, 124) * esc), w = Math.round(h * 0.85), rot = Math.round(entre(-9, 9)), esqs: Esq[] = ['tl', 'tr', 'bl', 'br'];
      const r = intentar(w, h, rot, () => esquina(esqs[Math.floor(rng() * 4)], w, h, Math.round(entre(0, 30)))); if (!r) return false;
      registrar('calcetin', r.c, g(r.p.x, r.p.y, E.calcetin(w, h), rot, w, h), PRIORIDAD.calcetin); return true;
    },
    sombrero: () => {
      const w = Math.round(entre(72, 104) * esc), h = Math.round(w * 0.8), rot = Math.round(entre(6, 14)), G = d.lay.garantia;
      // primero sobre el borde de la etiqueta de garantia (sentado en su esquina superior derecha, sin tapar su texto); si no cabe, en una esquina libre
      const sobre = { x: G.x + G.w - w * 0.9, y: G.y - h + 2, w, h }, cs = rotada(sobre, rot);
      if (libre(cs, 6, 'garantia') && !intersecta({ x: cs.x, y: cs.y, w: cs.w, h: cs.h - 6 }, { x: G.x, y: G.y, w: G.w, h: G.h })) { registrar('sombrero', cs, g(sobre.x, sobre.y, E.sombreroSanta(w, h), rot, w, h), PRIORIDAD.sombrero); return true; }
      const esqs: Esq[] = ['tl', 'tr', 'bl', 'br'], r = intentar(w, h, rot, () => esquina(esqs[Math.floor(rng() * 4)], w, h, Math.round(entre(0, 24))));
      if (!r) return false;
      registrar('sombrero', r.c, g(r.p.x, r.p.y, E.sombreroSanta(w, h), rot, w, h), PRIORIDAD.sombrero); return true;
    },
    monte: () => {
      const w = Math.round(entre(170, 470) * esc), h = Math.round(Math.min(entre(46, 88), w * 0.3) * esc), r = intentar(w, h, 0, () => ({ x: rng() < 0.5 ? entre(0, W * 0.25) : entre(W * 0.75 - w * 0.5, W - w), y: H - h }));
      if (!r) return false;
      registrar('monte', r.c, g(r.p.x, r.p.y, E.monticulo(w, h, oscuro)), PRIORIDAD.monte); return true;
    },
    luces: () => {
      const h = 46;
      for (let k = 0; k < 6; k++) {
        const x0 = Math.round(entre(0, W * 0.3)), w = Math.round(Math.min(W - x0, entre(W * 0.5, W) * (1 - k * 0.1)));
        const c = { x: x0, y: 0, w, h }; if (!libre(c, 8)) continue;
        registrar('luces', c, g(x0, 0, E.luces(w, h, rng, oscuro)), PRIORIDAD.luces); return true;
      }
      return false;
    },
    destello: () => {
      const r = Math.round(entre(11, 26) * esc), color = rng() < 0.55 ? (oscuro ? E.BLANCO : E.ORO) : E.ORO_CLARO;
      const res = intentar(r * 2, r * 2, 0, () => ({ x: entre(0, W - r * 2), y: entre(0, H - r * 2) }), undefined, 10); if (!res) return false;
      registrar('destello', res.c, g(res.p.x + r, res.p.y + r, E.destello(r, color)), PRIORIDAD.destello); return true;
    },
  };

  // ── elementos grandes: se elige por peso hasta llegar a la cantidad de la intensidad ──
  const [base, extra] = CANTIDAD[inten], meta = base + Math.floor(rng() * (extra + 1));
  const usados: Partial<Record<Tipo, number>> = {};
  const habilitados = (Object.keys(perfil.pool) as Tipo[]).filter((t) => elementoActivo(tema, FLAG[t]) && (perfil.pool[t] ?? 0) > 0);
  let colocados = 0;
  for (let intento = 0; intento < meta * 7 && colocados < meta && habilitados.length; intento++) {
    const disponibles = habilitados.filter((t) => (usados[t] ?? 0) < MAX_POR_TIPO[t]);
    if (!disponibles.length) break;
    const total = disponibles.reduce((s, t) => s + (perfil.pool[t] ?? 0), 0);
    let r = rng() * total, tipo = disponibles[0];
    for (const t of disponibles) { r -= perfil.pool[t] ?? 0; if (r <= 0) { tipo = t; break; } }
    if (colocar[tipo]()) { usados[tipo] = (usados[tipo] ?? 0) + 1; colocados++; }
    else usados[tipo] = (usados[tipo] ?? 0) + 0.34;            // un tipo que no cabe se descarta tras varios fallos
  }

  // ── nieve (debajo de todo lo demas): particulas y bokeh, siempre fuera de las zonas protegidas ──
  let nieve = '';
  if (elementoActivo(tema, 'nieve')) {
    const [cant, bokeh] = NIEVE[inten], color = oscuro ? '#FFFFFF' : '#8FA8CC';
    const punto = (r: number, opMin: number, opMax: number) => {
      for (let k = 0; k < 4; k++) {
        const x = entre(r, W - r), y = entre(r, H - r), c = { x: x - r, y: y - r, w: r * 2, h: r * 2 };
        if (zonas.some((z) => intersecta(c, z.caja, 3))) continue;
        cajas.push({ tipo: 'nieve', caja: c });
        nieve += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${color}" fill-opacity="${n(entre(opMin, opMax))}"/>`; return;
      }
    };
    for (let i = 0; i < bokeh; i++) punto(entre(8, 16), oscuro ? 0.1 : 0.14, oscuro ? 0.2 : 0.24);
    for (let i = 0; i < cant; i++) punto(entre(1.4, 4.8), oscuro ? 0.35 : 0.4, oscuro ? 0.9 : 0.75);
  }

  partes.sort((a, b) => a.prio - b.prio);
  return { svg: nieve + partes.map((p) => p.svg).join(''), cajas };
}

export const TEMA_NAVIDAD: DefinicionTema = {
  id: 'navidad', nombre: 'Navidad VisionSmart', emoji: '🎄',
  elementos: ['nieve', 'pino', 'regalos', 'luces', 'arboles', 'calcetines', 'sombreros', 'munecos', 'montes', 'destellos', 'etiquetas'],
  etiquetasPromo: ETIQUETAS_PROMO_NAVIDAD,
  capa: capaNavidad,
};

/** Etiqueta navideña del modo promocion (solo reemplaza «OFERTA»; no inventa descuentos ni condiciones). */
export function etiquetaNavidad(tema: TemaCtx, plantillaId: string, actual: string | null): string | null {
  if (!actual || !elementoActivo(tema, 'etiquetas') || tema.etiquetaPromo === null) return actual;
  if (typeof tema.etiquetaPromo === 'string' && tema.etiquetaPromo.trim()) return tema.etiquetaPromo.trim().toUpperCase().slice(0, 40);
  return ETIQUETAS_PROMO_NAVIDAD[hashSemilla(`etiqueta|${tema.productoId ?? ''}|${plantillaId}|${tema.semilla ?? ''}`) % ETIQUETAS_PROMO_NAVIDAD.length];
}