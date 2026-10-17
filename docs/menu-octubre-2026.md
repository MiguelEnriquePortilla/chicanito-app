# Menu de pedidos ? 16 octubre 2026

Se sincroniza chicanito.app con las 20 presentaciones del menu publicado en Very Sabrosito. Las 20 imagenes de MENU/02-ORIGINALES/Octubre-2026 se copian intactas a assets/menu/octubre-2026; fuentes y hashes en menu-assets.json. No se usan los cuadrados POSTER. El arte completo se separa del texto y botones para no tapar precios.

## Catalogo y precios
ROSTI: Chicanito 189; con arroz 209; y medio 254; medio 110; doble 389; cuarto 85; solo 129; cuarto solo 50 (pierna y muslo) / 60 (pechuga y ala).
CRUJI: Duo 89; Trio 99; Cuatro 115; Ocho 229; Doce 254; Jueves 229 (12 piezas, salsa chica, solo jueves); pollo solo 159; pieza 25 / pechuga 30.
Costilla Chicanita: cuarto 129, medio kilo 249, kilo 459; dos complementos a elegir, pueden repetirse. Costilla sola: minimo 250 g, 90 aprox., 0.36/g sujeto al peso real. Cada unidad del carrito solicita aproximadamente 250 g; la nota viaja al pedido.
Complementos: siete vigentes, seis a 160/kg y papas gajo a 200/kg. Porciones 125,250,500,1000 g calculadas proporcionalmente. Arroz corregido de 30 por 250 g a 40 por 250 g. Se retiran pure y ensalada de col, combo Coca-Cola sin PQ11 vigente y salsa mango habanero fuera del catalogo aprobado. Las piezas se ofrecen por unidad, no como complementos de 250 g.
Salsas Verde/BBQ/Chipotle: 8/15/25 (chica/mediana/grande). Adobos Tradicional/Tres Chiles/Chipotle: 35.

## Promo conservada
Cruji con pilon octubre 2026 se mantiene independiente con su arte, precio 229, 12 piezas y 250 g de papas gajo gratis. Sin cambios a fechas, condiciones o motor promocional. No sustituye Cruji Doce regular de 254.

## Carritos y compatibilidad
MENU_VERSION=20261016. Cada nuevo item guarda version. Los carritos anteriores no pueden continuar con precios o variantes retiradas: se reinician y se informa al usuario al volver al inicio. Los pedidos ya confirmados no se reescriben. Recursos JS/CSS del flujo tienen URL versionada. No se cambia telefono, pago, horarios, base de datos ni envio de WhatsApp.

## Verificacion
Prueba reproducible: node tests/menu-octubre-2026.mjs. Comprueba catalogo, recargos, restriccion jueves en zona Mexico, carritos antiguos, vigencia de promo y hashes originales. Revision visual local a 390 px, seleccion Salsa Verde en Duo, promo agregada por boton y subtotal 318 conservado al pasar a checkout. No confirmar pedidos ni enviar WhatsApp en pruebas reales.

## Pendiente independiente
Notificaciones Android pertenecen a Very Sabrosito; Knock conectado y Firebase very-sabrosito creado. Todavia falta configurar FCM/credenciales, integrar y comprobar recepcion real. Ver WEBSITE/NOTIFICACIONES-ANDROID.md. No se anunciaron como activas.
