/** Generador pseudoaleatorio determinista (mulberry32): misma semilla -> misma secuencia (pruebas y "regenerar igual"). */
export function crearAleatorio(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Reparte `n` imagenes entre `plantillas` al azar SIN repetir la misma plantilla en dos imagenes consecutivas (si hay mas de una).
 * Reparto parejo: se baraja una "bolsa" con todas las plantillas y se vacia entera antes de volver a llenarla, cuidando que la primera
 * de una bolsa nueva no sea igual a la ultima de la anterior.
 */
export function repartirPlantillas<T>(n: number, plantillas: readonly T[], aleatorio: () => number = Math.random): T[] {
  if (n <= 0 || plantillas.length === 0) return [];
  if (plantillas.length === 1) return Array.from({ length: n }, () => plantillas[0]);
  const out: T[] = [];
  while (out.length < n) {
    const bolsa = [...plantillas];
    for (let i = bolsa.length - 1; i > 0; i--) { const j = Math.floor(aleatorio() * (i + 1)); [bolsa[i], bolsa[j]] = [bolsa[j], bolsa[i]]; }
    if (out.length > 0 && bolsa[0] === out[out.length - 1]) {            // evita la repeticion en la costura entre bolsas
      const k = 1 + Math.floor(aleatorio() * (bolsa.length - 1));
      [bolsa[0], bolsa[k]] = [bolsa[k], bolsa[0]];
    }
    out.push(...bolsa);
  }
  return out.slice(0, n);
}