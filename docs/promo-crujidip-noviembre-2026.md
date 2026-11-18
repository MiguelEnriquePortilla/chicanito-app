# CrujiDip gratis con Cruji Doce — noviembre 2026

Confirmado por Miguel: un CrujiDip mediano (4 oz) a elegir gratis por cada Cruji Doce de $254; todo noviembre de 2026, hasta el 30 inclusive, zona America/Mexico_City. Conserva 12 piezas, salsa grande y papas gajo grandes.

Sabores: Diablo Chicanito, BBQ JOJUTOWN, Limón Pimienta, Ranch Jalapeño, Miel Picante, Buffalo y Parmesano. Elección obligatoria al agregar; puede cambiarse desde el carrito. Los carritos anteriores completan ahí su elección.

Regalo derivado por sabor y cantidad a $0, sin duplicarse al recargar. Solo paquete-4 (Cruji Doce). No aplica a Cruji Ocho, ROSTI, Cruji Jueves. El 18 de noviembre se retiraron la portada y las dos fichas de Bravas de $229. Fuera de noviembre se retiran el banner, el selector y el regalo.

El 18 de noviembre se publicó un solo banner de CRUJI-DIPS arriba del menú. El botón «Elegir Cruji Doce · $254» abre directamente el selector del paquete. La ficha del Cruji Doce muestra su imagen habitual. El cartel del Apagón quedó como antecedente de la publicación social.

Banner publicado: `assets/menu/crujidip-gratis-4oz-banner.webp`. El dip se registra por sabor y cantidad a $0 en el carrito, el resumen y el mensaje de WhatsApp.

Pruebas: tests/crujidip_promotion.py (sabores, costo cero, elegibilidad, cantidades, idempotencia, retiro de Bravas y límites CDMX); tests/crujidip_flow.py (390 y 1280 px: elección, edición, cantidad x2, recarga, checkout, WhatsApp y payload con API interceptada, sin pedidos reales).

Publicado en [Chicanito App](https://www.chicanito.app/) el 18 de noviembre de 2026. Retiro de Bravas y tamaño del dip en `e90bde2`. Banner y acceso directo en `cb136d8`. Flujo verificado en producción a 390 y 1280 px con API interceptada.
