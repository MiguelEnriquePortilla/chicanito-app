# Noviembre 2026 — No paramos · Bravas Habaneras

## Acuerdo y arte vigente

Miguel aprobó el cartel y corrigió el lema a **NOVIEMBRE CON «N» DE NO PARAMOS**. Gajos Bravas Habaneras gratis en la compra de 12 piezas CRUJI o ROSTI por la app. Sazón seco de habanero, paprika y toque cítrico; sin ajo. Leyenda final: **Válido todo NOVIEMBRE 2026**. Condición de compra inmediatamente debajo de GRATIS.

Dirección visual aprobada: rojo profundo, tipografía blanca y dorada, fotografía cercana de gajos con una mano, sello Chicanito y franja azul proporcionada. QR original confirmado, insertado como imagen independiente; no regenerado con IA. Tabloide vertical 11 × 17 pulgadas, una página.

- [PDF vigente en Drive](https://drive.google.com/file/d/1p4wzdlwlUIa7Xg3siY4fOfNw9AkD83cE/view).
- [Campaña y recursos](https://drive.google.com/drive/folders/1aRs1TzA8k4hoxd3yNMICtiy4kTYEf4K3).
- [Versiones anteriores — PARA BORRAR](https://drive.google.com/drive/folders/17_1KzAdTAdjBlssLNhZJrR2vJ0L1rkLl). Dos PDF apartados sin borrado permanente. Finales conserva únicamente el PDF v3 con vigencia.

## Implementación

Se conservan los precios y variantes del menú vigente: Chicanito y medio (paquete-3) y Cruji Doce (paquete-4), ambos $254. Cruji Jueves conserva $229 y su restricción de jueves. La campaña no establece un precio nuevo ni reactiva el paquete vencido de octubre.

Del 1 al 30 de noviembre de 2026, hora de Ciudad de México, los paquetes de 12 piezas anteriores generan 250 g de gajos Bravas Habaneras gratis por paquete. Se conserva lo que ya incluye cada paquete; no se sustituye una guarnición pagada por el regalo. El regalo se deriva de la cantidad elegible en el carrito; no se duplica al recargar. Aparece en checkout, confirmación y mensaje de WhatsApp.

Inicio muestra el cartel aprobado y botones para elegir ROSTI o CRUJI, con precio tomado del catálogo. El cartel se mantiene completo y los controles van fuera de la imagen. Los botones de compra son visibles en celular sin desplazarse. No se modifica el píxel, envío, pagos ni APIs de pedidos.

## Validación

- `python tests/november_promotion.py`: elegibilidad, cantidades, ausencia de duplicados y límites de vigencia CDMX.
- `python tests/november_flow.py`: 390 y 1280 px, arte, elección de producto, variantes, carrito, recarga, resumen, confirmación, regalo por cantidad y texto de WhatsApp. API interceptada; sin pedidos ni mensajes reales.
- `python tests/october_promotion.py`: regresión de octubre pasa en 390 y 1280 px.
- Prueba histórica `promotion_flow.py` de septiembre falla por esperar precio $85; el catálogo vigente ya tiene $89 antes de esta campaña. No se modificó esa prueba ni el precio.
- Revisión visual de ambas capturas y detector de distribución Impeccable sin hallazgos mecánicos.

## Publicación

Preparada para publicar por GitHub main, que dispara Vercel. La verificación de producción se registra al terminar el despliegue.
