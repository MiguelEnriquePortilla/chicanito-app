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

document.getElementById('back-to-menu-link').addEventListener('click', (e) => {
  e.preventDefault();
  chicanitoGo('index.html');
});

// ---------- Confeti de celebración (una sola vez al llegar a esta pantalla) ----------
function lanzarConfeti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colores = ['#E30613', '#17213E', '#FFF7EC', '#FFFFFF'];
  const piezas = 26;
  for (let i = 0; i < piezas; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 6 + Math.random() * 6;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 0.4}px`;
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colores[i % colores.length];
    document.body.appendChild(piece);

    if (typeof piece.animate !== 'function') {
      piece.remove();
      continue;
    }
    const fallDistance = window.innerHeight + 40;
    const drift = (Math.random() - 0.5) * 160;
    const rotation = (Math.random() - 0.5) * 720;
    const anim = piece.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${drift}px, ${fallDistance}px) rotate(${rotation}deg)`, opacity: 0 },
      ],
      { duration: 1600 + Math.random() * 900, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)', delay: Math.random() * 250 }
    );
    anim.onfinish = () => piece.remove();
  }
}
lanzarConfeti();
