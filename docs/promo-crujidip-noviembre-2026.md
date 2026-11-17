# CrujiDip gratis con Cruji Doce — noviembre 2026

Confirmado por Miguel: un CrujiDip a elegir gratis por cada Cruji Doce de $254; todo noviembre de 2026, hasta el 30 inclusive, zona America/Mexico_City. Conserva 12 piezas, salsa grande y papas gajo grandes.

Sabores: Diablo Chicanito, BBQ JOJUTOWN, Limón Pimienta, Ranch Jalapeño, Miel Picante, Buffalo y Parmesano. Elección obligatoria al agregar; puede cambiarse desde el carrito. Los carritos anteriores completan ahí su elección.

Regalo derivado por sabor y cantidad a $0, sin duplicarse al recargar. Solo paquete-4 (Cruji Doce). No aplica a Cruji Ocho, ROSTI, Cruji Jueves ni Bravas de $229. Convive con Bravas. Fuera de noviembre se retiran anuncio, selector y regalo; vuelve la imagen habitual.

Arte aprobado: https://drive.google.com/file/d/1oxQnep-ZajjeBoBJrCL4QCbKvODj1mhR/view ; copia pública assets/menu/cruji-doce-dip-noviembre-2026.png. Sin cambios a precios, pagos ni estructura de base de datos.

Pruebas: tests/crujidip_promotion.py (sabores, costo cero, elegibilidad, cantidades, idempotencia, coexistencia y límites CDMX); tests/crujidip_flow.py (390 y 1280 px: elección, edición, cantidad x2, recarga, checkout, WhatsApp y payload con API interceptada, sin pedidos reales). Regresión Bravas: tests/november_promotion.py y tests/november_flow.py.

Publicado: commit funcional 1111805, Vercel READY, 17 noviembre 2026. https://chicanito.app/.