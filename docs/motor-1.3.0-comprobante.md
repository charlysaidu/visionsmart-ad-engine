# Motor 1.3.0 · Comprobante de compra

Módulo `src/comprobante/`: la «nota de entrega premium» que Sistema PC envía al cliente por correo tras una venta. Solo cambia el DISEÑO del PDF; el cálculo de la venta y el servicio de correo no se tocan.

- **API**: `renderComprobante(datos): string[]` (una página SVG por hoja) y `renderComprobanteConFuentes` (fuentes Jakarta incrustadas, para Chromium/Electron).
- **Tamaño**: viewBox 1240 × 1754 (A4 a 150 dpi); `width/height` 2480 × 3508 px (A4 a 300 dpi). Sistema PC rasteriza a PNG y pdfkit lo envuelve en un PDF A4.
- **Datos**: `DatosComprobante` llega ya calculado (montos en `$` o `Bs`). Nada se inventa: sin correo, teléfono, dirección, modelo, foto o garantía, el bloque se adapta. Mostrador y pickup dicen «Retiro en tienda». PAGADO siempre.
- **Contacto**: `CONTACTO_VISIONSMART` es la ÚNICA fuente del Instagram y del correo de soporte (`CORREO_SOPORTE = visionsmart2019@gmail.com`). WhatsApp se agregará después.
- **Paginación**: hasta 5 productos en una hoja; con más, hojas parejas de hasta 6 (10 → 5 + 5). Las hojas siguientes repiten encabezado y panel («hoja n de N») y solo la última lleva subtotal y total. Nunca se elimina un producto ni se reduce el texto.
- **Colores**: perla `#F4F1EA`, azul `#1367A4`, morado `#9D3FCB`, degradado azul → morado. Nunca `#1266A3` ni `#9D40CB`.
- **Pruebas**: `test/v12.test.ts` (tamaño, paginación 1–30, textos sin pisarse ni salirse, contraste AA, datos opcionales, monedas, correo único).
- Las huellas de las 20 plantillas y el PDF borde a borde no cambian.
