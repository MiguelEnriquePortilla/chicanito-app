## Cierre definitivo aceptado - 5 noviembre 2026

Miguel confirma: "LISTO. DOCUMENTA. GUARDA. CIERRA".

**Oferta definitiva: $229 por solo 12 piezas ROSTI o CRUJI + gajos Bravas Habaneras gratis. Sin arroz, adobo, salsa ni opciones.** Este acuerdo sustituye cualquier indicacion anterior de conservar variantes o acompanamientos.

Commit funcional publicado: 6e9d5286ed78b42a69ca08d7b41fd912bc13aad1. Vercel success confirmado. Pruebas locales aprobadas en celular y escritorio: agregado sin modal, carrito $229/$458, gajos gratis, checkout y WhatsApp sin acompanamientos. Migracion de carritos anteriores y vencimiento comprobados; regresion octubre aprobada. Paquetes regulares conservan precio y opciones. Sin pedidos reales ni mensajes enviados.

La ultima comprobacion en navegador publico fue bloqueada por un error del entorno local; no confundir las pruebas locales con verificacion visual de produccion. El despliegue se verifico por GitHub/Vercel y Miguel acepto el resultado.

Solicitud original de correccion: "las 12 piezas NO llevan NADA - NADA. Son solo las piezas = las papas gajo bravas grtais (le pusiste opciones)". Se implementaron dos productos independientes de promocion, sin variantes.

Sesion cerrada. Sin pendientes funcionales; esperar nuevas instrucciones. La sincronizacion de README locales quedo bloqueada por permisos del entorno; este documento remoto es la continuidad vigente.

---

## Correccion vigente - 5 noviembre 2026: SOLO piezas y gajos

Miguel aclara que la promo de $229 incluye exclusivamente 12 piezas ROSTI o CRUJI y los gajos Bravas Habaneras gratis. No incluye arroz, adobo, salsa ni opciones. Esta aclaracion sustituye la indicacion anterior de conservar variantes y acompanamientos del paquete regular.

Se crean dos productos de promocion independientes, sin variantes; los botones agregan directamente al carrito. Se normalizan carritos guardados con los antiguos paquetes a $229 para retirar sus opciones. Los paquetes regulares mantienen sus precios y opciones; la promo termina el 30 de noviembre de 2026 (CDMX). No se generan pedidos reales ni mensajes durante las pruebas.

---

## Correccion de precio - 5 noviembre 2026

Miguel confirma $229, no $254, para la promo de 12 piezas ROSTI o CRUJI con gajos Bravas Habaneras gratis. Aplica durante noviembre (CDMX), en botones, seleccion, carrito, checkout y WhatsApp; corrige carritos existentes. Al terminar noviembre vuelve el precio regular. Esta indicacion sustituye la conservacion de $254 indicada en el cierre anterior. Los artes del menu regular conservan su precio impreso; la seccion promocional y el cobro usan $229.

---

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

Inicio muestra una sección integrada con fotografía sin texto ni QR, texto HTML de campaña y botones ROSTI/CRUJI con precio del catálogo. Se conserva todo el mensaje comercial; se quita el cintillo del QR y el aviso superior repetido. Escritorio: foto y texto en dos columnas. Celular: foto arriba y texto con botones debajo, visibles sin desplazarse. El PDF tabloide conserva su QR. No se modifica el píxel, envío, pagos ni APIs de pedidos.

## Validación

- `python tests/november_promotion.py`: elegibilidad, cantidades, ausencia de duplicados y límites de vigencia CDMX.
- `python tests/november_flow.py`: 390 y 1280 px, arte, elección de producto, variantes, carrito, recarga, resumen, confirmación, regalo por cantidad y texto de WhatsApp. API interceptada; sin pedidos ni mensajes reales.
- `python tests/october_promotion.py`: regresión de octubre pasa en 390 y 1280 px.
- Prueba histórica `promotion_flow.py` de septiembre falla por esperar precio $85; el catálogo vigente ya tiene $89 antes de esta campaña. No se modificó esa prueba ni el precio.
- Revisión visual de ambas capturas y detector de distribución Impeccable sin hallazgos mecánicos.

## Publicación

### Corrección de integración web — 2 noviembre

Miguel rechazó la apariencia de cartel sobrepuesto. La app ahora integra la campaña en un recuadro con fotografía sin letras ni QR y texto HTML: lema, sabor, GRATIS, condición y vigencia. Se elimina exclusivamente el cintillo de QR en la web y el aviso superior duplicado; el PDF de impresión conserva su QR. En escritorio foto y texto comparten dos columnas; en celular la foto encabeza el recuadro y los dos botones quedan visibles. Se conservan precios, reglas y regalo. Pruebas de noviembre y recorrido de compra pasan a 390 y 1280 px; captura revisada visualmente y detector Impeccable sin hallazgos.

Versión funcional vigente publicada por GitHub main: **`8b9dd8e`**. Sustituye la integración inicial `ace540b`. Producción verificada en https://www.chicanito.app/: sección nativa, texto HTML completo, imagen `bravas-noviembre-foto.png` cargada y aviso duplicado oculto. No se crearon pedidos reales ni se enviaron mensajes. Las capturas `inicio-390.png` e `inicio-1280.png` reflejan el diseño final; la antigua captura `produccion-390.png` corresponde a la versión inicial y es antecedente.

Archivo PNG vigente respaldado en Drive: https://drive.google.com/file/d/1EpWx3akfgjF4slP-ZpkefDBmFxF90OcD/view. PDF y PNG conservan QR original aprobado. La resolución del arte procede de la generación original; no se afirma que sea un maestro de 300 dpi.

## Aprobación y cierre

Miguel confirmó «Perrrfect!» después de la corrección web y pidió «documenta. guarda. organiza. cierra la sesion». Entrega aceptada y sesión cerrada el 2 de noviembre de 2026. Mantener separados impresión (con QR), web (sin cintillo de QR), recursos, acuerdos y versiones anteriores para borrar. Sin pendientes de esta solicitud; esperar nuevas instrucciones. No borrar permanentemente los anteriores ni modificar más la app por iniciativa propia.
