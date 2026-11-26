# Motor 1.1.0 · Colección 02 (plantillas 11–20)

Se **añaden** 10 plantillas; las 10 de la Colección 01 no cambian (sus 360 huellas de regresión de 1.0.0 siguen pasando byte a byte). Total: 20.
Mismo contrato que 1.0.0 (ver `motor-1.0.0-plantillas.md`): 4:5 de 1080 × 1350 con fondo completo, franja del pie translúcido (y ≥ 1190) libre, nada a menos de 48 px de los bordes, producto sin deformar, logo original, paleta `#1367A4` / `#9D3FCB` / perla `#F4F1EA` / negro, Navidad sin invadir zonas, promociones legibles (contraste ≥ 4,5:1).

| # | ID | Idea | Composición 4:5 |
|---|---|---|---|
| 11 | `neon-edge` | neón elegante sobre negro: líneas diagonales luminosas tras el producto | espejo: título y precio a la derecha, producto a la izquierda, lista a la derecha, botón de garantía |
| 12 | `clean-hex` | minimalismo geométrico, hexágonos azules y morados | cuadrantes: título, producto a la derecha, bloques 2×2 abajo, precio abajo a la derecha |
| 13 | `cosmic-flow` | ondas luminosas moradas y azules, profundidad | título arriba, producto central, precio a la izquierda y fila de características |
| 14 | `minimal-stripes` | líneas verticales azules y moradas | asimétrica: producto a la izquierda, columna de texto estrecha a la derecha |
| 15 | `black-grid` | cuadrícula sutil, puntos y líneas, iconos lineales | producto arriba, título a la izquierda, precio a la derecha, fila de iconos |
| 16 | `pearl-wave` | ondas suaves sobre blanco perla | título centrado, producto grande, garantía a la izquierda, precio a la derecha |
| 17 | `dual-tone` | negro, azul y morado en secciones diagonales | título sobre negro/azul, producto cruzando a la base morada con precio y garantía |
| 18 | `info-box` | información organizada en bloques con borde fino | producto en tarjeta, bloques de datos **reales** a la derecha, precio abajo |
| 19 | `vision-frame` | marco luminoso azul-morado, simetría | todo centrado dentro del marco |
| 20 | `diagonal-split` | bloque negro diagonal sobre blanco perla, franjas azul y morada en el corte | título en el bloque negro, lista y precio sobre el perla, producto cruzando el corte |

## Qué cambió en el motor

- `plantillas-02.ts` (nuevo): las 10 configuraciones; `paleta.ts` (nuevo): colores compartidos; `plantillas.ts` solo las suma (`PLANTILLAS = { ...01, ...02 }`).
- Capas nuevas en `capas.ts`: `onda`, `rejilla`, `hex`, `borde` (marco luminoso). `Capa.solo` admite `'4x5'` y `'otros'` (1x1 + 9x16).
- `Plantilla.numero / coleccion / descripcion` en las 20 (para los selectores) y `Plantilla.colores` (`titulo`, `lista`, `vigencia`, `tachado`) + `superficies` para composiciones con zonas de distinto color (DIAGONAL SPLIT, DUAL TONE). Las plantillas 1–10 no los usan: su salida no cambia.
- `Layout.lista.soloReales` + `caracteristicasDe(producto, max, soloReales)`: INFO BOX muestra solo descripción, conectividad, conector, potencia y marca leídos del inventario (sin frases de relleno ni por categoría; un producto sin esos datos no inventa nada).
- Etiqueta de precio apilada (p. ej. «PRECIO ESPECIAL DE NAVIDAD») más ancha que el precio anterior: en la Colección 02 se corre a la izquierda para respetar el margen derecho.
- Sin lista de características a propósito (aire/minimalismo): PEARL WAVE, DUAL TONE, VISION FRAME.

## Pruebas

`v11.test.ts`: 6 tipos de producto (cargador, cable, audífonos, reloj inteligente sin garantía ni foto, corneta, batería portátil) × con/sin promoción × con/sin Navidad × 3 formatos × 10 plantillas (720 combinaciones): SVG válido, textos dentro del lienzo y de los márgenes, ningún texto pisa a otro ni toca el recuadro de la garantía; nombres cortos/normales/larguísimos; INFO BOX solo con datos reales. `v10` (contrato, contraste, Navidad, distintividad entre pares) corre ahora sobre las 20.
