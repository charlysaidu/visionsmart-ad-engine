# Motor 1.0.0 · rediseño de las 10 plantillas

Reemplazo 1:1 de las 10 plantillas (mismos IDs: `black-premium`, `pure-white`, `blue-signature`, `purple-edition`, `gradient-experience`,
`product-spotlight`, `tech-editorial`, `modern-glass`, `dynamic-tech`, `luxury-minimal`). No hay migración: lo ya generado conserva su imagen.

## Contrato (lo verifica `test/v10.test.ts`)

| Regla | Cómo se cumple |
|---|---|
| 4:5, 1080 × 1350 px | cada SVG empieza con el fondo de 1080 × 1350 (nada de márgenes ni bordes transparentes) |
| Borde a borde (R20) | la franja inferior (y ≥ 1190 = los 120 pt del pie translúcido del PDF) queda libre: solo el pie centrado `visionsmart.app · @visionsmart.app` en y 1310 y, en promoción, la vigencia justo encima. Fecha y número del PDF quedan en las esquinas inferiores, libres |
| Nada pegado a los bordes | texto y producto a ≥ 48 px de cada lado (el logo en píldora está a x = 48) |
| Producto sin deformar | `preserveAspectRatio="xMidYMax meet"` siempre; PNG transparente apoyado abajo y centrado |
| Datos reales | nombre, precio, garantía, `marcas`/conector/descripción (lista de características). «Modelos compatibles» = el campo `marcas` que ya existe; no hay campo nuevo |
| Logo oficial | el PNG original de `src/logo.ts` (SHA-256 `8e1639f5…`), una vez por imagen, sin tocar. «VISIONSMART» es texto con degradado |
| Navidad | la capa del tema va encima; las zonas protegidas salen del layout (lista vacía = sin zona; la píldora del logo tiene su zona más ancha) |
| Promociones | `calcularPromo` y `promoExtras` intactos; precio anterior tachado al 94 % y chip −N % con contraste ≥ 4,5:1 sobre los fondos nuevos |

Paleta: azul `#1367A4`, morado `#9D3FCB`, blanco perla `#F4F1EA`, negro `#000000` (+ tonos luminosos de azul y morado solo para luces sobre negro). `#1266A3` no se usa.

## Arquitectura (qué cambió)

- `plantillas.ts` · cada plantilla = paleta + **capas decorativas** (`Capa[]`) + opciones de foto (`rot`, `reflejo`, `sombra`) + chip −N % + tarjeta.
- `capas.ts` (nuevo) · luces, marcos, líneas, bandas diagonales, aros, discos, polígonos, puntos, **paneles de cristal**, aro de piso y **reflejo** del producto. Solo formas SVG con degradados (sin filtros, máscaras ni recortes → igual en Chromium y en react-native-svg). Coordenadas en fracciones del lienzo o de la caja de la foto; `solo: '4x5'` limita una capa a ese formato.
- `grad.ts` (nuevo) · degradados (movidos desde `primitivas.ts`).
- `layouts.ts` · **disposición 4:5 propia por plantilla** (`D45`); 1x1 y 9x16 siguen saliendo de la familia (`clasico` / `centrado` / `editorial`).
- `primitivas.ts` · plataforma con borde en degradado, sombras de contacto + ambiente, foto inclinada, garantía como botón, tarjetas / rejilla de características, logo en píldora blanca (`logo: 'pildora'`) para los fondos de color de marca, filete de acento bajo el precio.
- **LUXURY MINIMAL** tiene dos fondos: perla o negro. `ctx.variante: 'claro' | 'oscuro'`; sin indicar, `varianteSugerida(producto)` elige negro si el nombre dice blanco/white/perla/plateado y perla en los demás casos.
- Plantillas sin lista de características a propósito (`cantidad: 0`): PURPLE EDITION, GRADIENT EXPERIENCE, PRODUCT SPOTLIGHT («texto al mínimo») y LUXURY MINIMAL («pocos elementos»).

## API nueva (compatible hacia atrás)

`ContextoAnuncio.variante?`, `plantillaDe(id, variante?)`, `varianteSugerida(producto)`, tipo `Capa`, `Plantilla.capas / foto / chip / tarjeta`, `Layout.lista.modo 'rejilla'` + `bloque` + `pasoY`.
Sin cambios: `renderSvg(id, ctx, formato)`, `renderSvgConFuentes`, `calcularPromo`, `promoExtras`, temas, módulo de catálogo PDF.

## Regresión

`test/golden/1.0.0*.json` fijan la salida del 1.0.0 (360 huellas: sin tema y con Navidad). Se regeneran **a propósito** con `scripts/golden.ts` y `scripts/golden-1.0.ts` cuando el diseño cambie.
La salida de 1.0.0 **no** es byte-idéntica a 0.9.0: es un rediseño.
