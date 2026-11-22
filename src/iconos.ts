/** Iconos de linea (viewBox 24x24, trazo). Solo paths: se ven igual en cualquier plataforma (sin emojis). */
export type IconoId = 'ruido' | 'audio' | 'bateria' | 'rayo' | 'cable' | 'escudo' | 'telefono' | 'bluetooth' | 'gota' | 'check' | 'estrella' | 'chip' | 'diamante' | 'carga';

export const ICONOS: Record<IconoId, string[]> = {
  ruido: ['M4 14v-2a8 8 0 0 1 16 0v2', 'M4 14h3v6H4z', 'M17 14h3v6h-3z'],
  audio: ['M3 10v4', 'M7 7v10', 'M11 4v16', 'M15 8v8', 'M19 10v4'],
  bateria: ['M3 8h15v8H3z', 'M18 11h3v2h-3z', 'M6 11v2', 'M9 11v2'],
  rayo: ['M13 2L5 14h6l-1 8 8-12h-6z'],
  cable: ['M9 15l6-6', 'M7 11l-2 2a3 3 0 0 0 4 4l2-2', 'M17 13l2-2a3 3 0 0 0-4-4l-2 2'],
  escudo: ['M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z', 'M8.5 12l2.5 2.5 4.5-5'],
  telefono: ['M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z', 'M11 18h2'],
  bluetooth: ['M7 7l10 10-5 4V3l5 4L7 17'],
  gota: ['M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  estrella: ['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z'],
  chip: ['M8 8h8v8H8z', 'M10 3v3', 'M14 3v3', 'M10 18v3', 'M14 18v3', 'M3 10h3', 'M3 14h3', 'M18 10h3', 'M18 14h3'],
  diamante: ['M6 3h12l4 6-10 12L2 9z', 'M2 9h20'],
  carga: ['M12 3v9', 'M8 8l4-5 4 5', 'M5 15h14', 'M7 19h10'],
};