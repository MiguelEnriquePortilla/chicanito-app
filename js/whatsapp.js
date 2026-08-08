// Construye el mensaje de pedido y el link de WhatsApp hacia el número fijo del negocio.
const WHATSAPP_NUMERO = '527341260080';

function formatoMoneda(valor) {
  return `$${valor.toFixed(0)}`;
}

function lineaDeItem(item) {
  const detalles = item.detalleVariantes ? ` — ${item.detalleVariantes}` : '';
  return `- ${item.cantidad}x ${item.nombre} (${formatoMoneda(item.precioUnitario)} c/u)${detalles}`;
}

function buildOrderMessage({ cart, cliente, metodoEntrega, ubicacionTexto, subtotal, envio, total, metodoPago, notas }) {
  const lineasPedido = cart.map(lineaDeItem).join('\n');
  const envioTexto = envio === 0 ? 'Gratis' : ENVIO_VARIABLE_MENSAJE;
  const totalTexto = envio === 0 ? formatoMoneda(total) : `${formatoMoneda(total)} + envío`;

  const partes = [
    '🐔 *Nuevo pedido - Chicanito*',
    '',
    `*Cliente:* ${cliente.nombre}`,
    `*Teléfono:* ${cliente.telefono}`,
  ];

  if (metodoEntrega === 'recoger') {
    partes.push('*Entrega:* Recoger en tienda');
  } else {
    partes.push('*Entrega:* A domicilio', `*Ubicación:* ${ubicacionTexto}`);
  }

  partes.push(
    '',
    '*Pedido:*',
    lineasPedido,
    '',
    `*Subtotal:* ${formatoMoneda(subtotal)}`,
    `*Envío:* ${envioTexto}`,
    `*Total:* ${totalTexto}`,
    `*Pago:* ${metodoPago}`,
  );

  if (notas && notas.trim()) {
    partes.push('', `*Notas:* ${notas.trim()}`);
  }

  return partes.join('\n');
}

function buildWhatsAppUrl(mensaje) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}
