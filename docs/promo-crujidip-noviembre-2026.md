# CrujiDip gratis con Cruji Doce ? noviembre 2026

Condiciones confirmadas por Miguel en el chat: un CrujiDip a elegir gratis por cada Cruji Doce de $254; todo noviembre de 2026, hasta el d?a 30 inclusive, zona America/Mexico_City. Se conservan las 12 piezas, salsa grande y papas gajo grandes del paquete.

Sabores: Diablo Chicanito, BBQ JOJUTOWN, Lim?n Pimienta, Ranch Jalape?o, Miel Picante, Buffalo y Parmesano. Elegir salsa y dip es obligatorio al agregar el paquete. El sabor se puede cambiar desde el carrito; los carritos anteriores pueden completar ah? su elecci?n.

El regalo se deriva del carrito a precio $0 por sabor y cantidad; no se persiste como producto pagado ni se duplica al recargar. Aplica solo a paquete-4 (Cruji Doce), sin extenderse al Cruji Ocho, ROSTI, Cruji Jueves ni al paquete Bravas de $229. Convive con la promoci?n Bravas sin modificarla. Fuera de noviembre se retiran anuncio, selector y regalo, conservando el paquete regular.

Arte: cartel v3 aprobado en Drive, https://drive.google.com/file/d/1oxQnep-ZajjeBoBJrCL4QCbKvODj1mhR/view ; copia p?blica assets/menu/cruji-doce-dip-noviembre-2026.png, mostrada en la tarjeta solo durante la vigencia. Descripci?n de la tarjeta mantiene los complementos del paquete. Sin cambios a precios, pagos ni estructura de base de datos.

Validaci?n: tests/crujidip_promotion.py prueba sabores, costo cero, elegibilidad, cantidades, idempotencia, coexistencia y l?mites CDMX. tests/crujidip_flow.py prueba m?vil 390 px y escritorio 1280 px, selector obligatorio, edici?n sin duplicar, cantidad x2, recarga, checkout, WhatsApp y payload de pedido. Las llamadas de escritura a la API se interceptan en las pruebas; no crean pedidos reales. Regresi?n de Bravas: tests/november_promotion.py y tests/november_flow.py.
