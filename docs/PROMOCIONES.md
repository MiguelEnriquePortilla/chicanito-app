# Promoción de septiembre de 2026

El Dúo corresponde a `paquete-9`, «2 Piezas Crujientes», de $85 (equivalencia confirmada por el negocio).
Del 1 al 30 de septiembre, hora de Ciudad de México, un pedido que incluya ese producto recibe una pieza crujiente adicional a $0. Dos o más Dúos siguen recibiendo una sola pieza adicional por pedido. No cambian precios, complementos, métodos de pago ni entrega.

## Cambios

- `js/promotions.js`: configuración de campaña y función compartida que deriva un solo regalo.
- `js/cart.js`: conserva los productos comprados en localStorage; recalcula el regalo al leer el carrito. El contador cuenta productos comprados.
- `index.html`, `js/home.js`, `styles.css`: banner inicial con botón «Ver Dúo» y renglón de regalo sin controles de cantidad.
- Las tres páginas cargan la campaña. Checkout incluye el regalo en el resumen y revalida el carrito al confirmar. Si el carrito o la vigencia cambió, pide revisar el resumen actualizado antes de continuar.
- La confirmación conserva la copia del pedido confirmada en checkout. Su renderizado, mensaje de WhatsApp y petición a `/api/crear-pedido` incluyen el regalo como un item a $0; el endpoint existente guarda esos items en JSON, sin migraciones.

## Probar manualmente

Servir la carpeta App con `python -m http.server 8081` y abrir http://localhost:8081 durante septiembre de 2026.

1. **Elegible:** pulsar «Ver Dúo», agregar «2 Piezas Crujientes» con sus opciones y abrir el carrito. Debe mostrar una pieza gratis y subtotal de $85. Continuar, seleccionar recogida y completar los datos: checkout y confirmación deben mostrar $85 y el regalo. El enlace de WhatsApp debe incluir esa pieza a $0.
2. **No elegible:** vaciar el carrito y agregar «3 Piezas Crujientes». Debe conservar su precio de $99, sin pieza adicional en carrito, checkout, confirmación ni mensaje.
3. **Límite:** subir el Dúo a cantidad 2: subtotal $170 y una sola pieza gratis. Recargar: sigue habiendo una sola. Quitar todos los Dúos: desaparece el regalo.
4. **Entrega y pago:** el regalo aplica tanto a recogida como a domicilio, y a los tres métodos de pago existentes. El envío conserva su cálculo y leyenda original.

El horario de pedidos que ya tenía la app sigue vigente. Las pruebas automatizadas fijan el reloj en horario abierto sin modificar el código de producción.

## Prueba automatizada

Ejecutar `python tests/promotion_flow.py` desde App. Requiere Python, Playwright y Microsoft Edge. Inicia un servidor temporal, prueba el flujo móvil, intercepta la API y examina el enlace de WhatsApp sin abrirlo ni enviarlo. Comprueba también límites de mes en CDMX, no repetición en 2027, recarga, eliminación y múltiples Dúos. Las capturas quedan en `docs/promo-septiembre/`.

La prueba verifica el contenido enviado a la API, no una escritura real en Neon ni la recepción de un WhatsApp.

## Cambiar la temporada

Agregar una entrada a `CAMPAIGNS` en `js/promotions.js` con identificador único, fechas `startsOn` / `endsOn`, `title`, `message`, `productId` y `ctaLabel`. Evitar fechas superpuestas: se selecciona la primera campaña vigente. El banner usa automáticamente la campaña activa cada vez que se abre o vuelve a la app.

Para otra campaña de una pieza gratis por pedido, configurar `giftName` y `giftDetail`. Una campaña informativa puede omitir `giftName`. Si la próxima promoción cambia la mecánica (descuentos, otro número de regalos, etc.), adaptar `applyPromotion` y sus pruebas antes de activarla; cambiar solo el banner no implementa una nueva mecánica.

No se inventó la promoción de octubre. Sin campaña configurada para ese mes, el banner se oculta y septiembre deja de aplicar. Estos cambios requieren publicar la versión actualizada de la app; todavía no hay un editor de campañas en el dashboard.
