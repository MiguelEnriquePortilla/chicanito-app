// Lógica de la página de confirmación: arma el mensaje final y el link de WhatsApp.

function formatoMoneda(v) {
  return `$${v.toFixed(0)}`;
}

const raw = sessionStorage.getItem('chicanito_pending_order');
if (!raw) {
  window.location.href = 'index.html';
}
const pedido = JSON.parse(raw);

document.getElementById('order-summary').innerHTML = pedido.cart
  .map(
    (it) => `
      <div class="order-summary-line">
        <span>${it.cantidad}x ${it.nombre}${it.detalleVariantes ? ` (${it.detalleVariantes})` : ''}</span>
        <span>${formatoMoneda(it.precioUnitario * it.cantidad)}</span>
      </div>
    `
  )
  .join('');
document.getElementById('summary-subtotal').textContent = formatoMoneda(pedido.subtotal);
document.getElementById('summary-envio').textContent = pedido.envio === 0 ? 'Gratis' : formatoMoneda(pedido.envio);
document.getElementById('summary-total').textContent = formatoMoneda(pedido.total);
document.getElementById('summary-entrega').textContent = pedido.metodoEntrega === 'recoger' ? 'Recoger en tienda' : 'A domicilio';
document.getElementById('summary-pago').textContent = pedido.metodoPago;

const mensaje = buildOrderMessage({
  cart: pedido.cart,
  cliente: pedido.cliente,
  metodoEntrega: pedido.metodoEntrega,
  ubicacionTexto: pedido.ubicacionTexto,
  subtotal: pedido.subtotal,
  envio: pedido.envio,
  total: pedido.total,
  metodoPago: pedido.metodoPago,
  notas: pedido.notas,
});

// Guarda el pedido en la base de datos para el dashboard interno (mejor esfuerzo:
// si falla o no está configurada, no afecta el envío por WhatsApp).
fetch('/api/crear-pedido', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(pedido),
}).catch(() => {});

const sendBtn = document.getElementById('send-whatsapp-btn');
sendBtn.href = buildWhatsAppUrl(mensaje);
sendBtn.addEventListener('click', () => {
  clearCart();
  sessionStorage.removeItem('chicanito_pending_order');
});
