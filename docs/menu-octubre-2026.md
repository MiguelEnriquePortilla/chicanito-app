## Icono: sello exacto de identidad 2026

Se sustituye el icono por el SELLO DE MARCA mostrado en identidad-referencia-p3.png. Fuente de alta resolucion extraida del PDF Chicken_Chicanito_Extension_Identidad_2026.pdf, pagina 3, imagen FormXob.38627257a651b65b92d089167d73f450.png, 1254x1254. No es el sello anterior de 270x260.

Fuente preservada en assets/brand/sello-marca-2026-original.png. PNG 192,512,maskable512 y Apple180 con escala proporcional y fondo blanco; maskable conserva zona segura. Archivo SVG contiene la imagen original empaquetada como PNG de 512 incrustado, NO un trazado vectorial inventado. Se conserva logo institucional del encabezado. Cambian iconos manifest, favicon SVG y Apple; la identidad/start_url de las apps no cambia. Reproduccion mediante preparar_iconos.py y registros SHA en PWA-ICONS.json. Mismo sello exacto en ambas apps por solicitud del usuario; los nombres de instalacion Chicanito / Very Sabrosito distinguen sus funciones.

Una instalacion Android existente puede mantener el icono anterior hasta que el navegador renueve su paquete; no confirmar actualizacion del telefono sin comprobarlo. Si persiste, reinstalar la app concreta. No borrar datos o pedidos para renovar iconos.

## Unificacion de menus, 16 octubre 2026

Se verifican 20 presentaciones regulares, 20 fotografias identicas por SHA-256, precios, descripciones, variantes y 13 extras. Las fichas de Very Sabrosito usan los mismos nombres y descripciones del catalogo de pedidos; se muestran precios variables desde y la costilla por peso como aproximada. Se indica solo jueves para Cruji Jueves. La promo de octubre permanece exclusiva de chicanito.app, ahora explicada en Very Sabrosito con la misma vigencia, precio y regalo; se oculta fuera del intervalo usando America/Mexico_City. No se cambia la promo ni el checkout.

Fuente compartida: 07-MARKETING/MENU/catalogo-digital.json; copia versionada en app/docs/catalogo-digital.json y site/assets/catalogo-digital.json. Website/scripts/preparar_assets.py consume esta fuente, no infiere precios desde nombres de imagen. Las tres imagenes de portada tambien se sustituyen por los mismos originales vigentes del catalogo. Para cambios futuros, actualizar el catalogo de pedidos y esta fuente en la misma entrega; reconstruir y ejecutar comparacion antes de publicar ambos repositorios.

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
