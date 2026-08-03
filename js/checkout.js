// Lógica de la página de checkout: resumen, ubicación, horario y método de pago.

function formatoMoneda(v) {
  return `$${v.toFixed(0)}`;
}

const cart = getCart();
if (cart.length === 0) {
  window.location.href = 'index.html';
}

const subtotal = getSubtotal(cart);
const envio = calcularEnvio(subtotal);
const total = subtotal + envio;

document.getElementById('order-summary').innerHTML = cart
  .map(
    (it) => `
      <div class="order-summary-line">
        <span>${it.cantidad}x ${it.nombre}${it.detalleVariantes ? ` (${it.detalleVariantes})` : ''}</span>
        <span>${formatoMoneda(it.precioUnitario * it.cantidad)}</span>
      </div>
    `
  )
  .join('');
document.getElementById('summary-subtotal').textContent = formatoMoneda(subtotal);
document.getElementById('summary-envio').textContent = envio === 0 ? 'Gratis' : formatoMoneda(envio);
document.getElementById('summary-total').textContent = formatoMoneda(total);

// ---------- Horario ----------
const hoursBannerEl = document.getElementById('hours-banner');
const abierto = estaAbierto();
hoursBannerEl.style.display = abierto ? 'none' : 'block';

// ---------- Ubicación ----------
let ubicacionTexto = '';
const shareLocationBtn = document.getElementById('share-location-btn');
const locationStatusEl = document.getElementById('location-status');
const manualAddressGroup = document.getElementById('manual-address-group');
const direccionManualEl = document.getElementById('direccion-manual');

shareLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    mostrarFallbackUbicacion('Tu navegador no soporta compartir ubicación. Escribe tu dirección abajo.');
    return;
  }
  locationStatusEl.textContent = 'Obteniendo tu ubicación...';
  locationStatusEl.className = 'location-status';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      ubicacionTexto = `https://maps.google.com/?q=${latitude},${longitude}`;
      locationStatusEl.textContent = '✓ Ubicación capturada correctamente.';
      locationStatusEl.className = 'location-status ok';
      manualAddressGroup.style.display = 'none';
    },
    () => {
      mostrarFallbackUbicacion('No pudimos obtener tu ubicación. Escribe tu dirección abajo.');
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

function mostrarFallbackUbicacion(mensaje) {
  ubicacionTexto = '';
  locationStatusEl.textContent = mensaje;
  locationStatusEl.className = 'location-status error';
  manualAddressGroup.style.display = 'block';
}

// ---------- Método de pago ----------
const optEfectivo = document.getElementById('opt-efectivo');
const optMercadoPago = document.getElementById('opt-mercadopago');
const mpStatusText = document.getElementById('mp-status-text');
let metodoPago = 'efectivo';
let mpDisponible = false;

function seleccionarPago(metodo) {
  metodoPago = metodo;
  optEfectivo.classList.toggle('is-selected', metodo === 'efectivo');
  optMercadoPago.classList.toggle('is-selected', metodo === 'mercadopago');
}

optEfectivo.addEventListener('click', () => seleccionarPago('efectivo'));
optMercadoPago.addEventListener('click', () => {
  if (mpDisponible) seleccionarPago('mercadopago');
});

// Verifica si el backend de Mercado Pago está configurado, sin romper el flujo si no lo está.
fetch('/api/mp-status')
  .then((r) => (r.ok ? r.json() : { enabled: false }))
  .then((data) => {
    mpDisponible = !!data.enabled;
    if (!mpDisponible) {
      optMercadoPago.classList.add('is-disabled');
      mpStatusText.textContent = 'Próximamente.';
    }
  })
  .catch(() => {
    mpDisponible = false;
    optMercadoPago.classList.add('is-disabled');
    mpStatusText.textContent = 'Próximamente.';
  });

// ---------- Confirmar pedido ----------
document.getElementById('confirm-btn').addEventListener('click', async () => {
  if (!estaAbierto()) {
    alert('Estamos cerrados por ahora. Recibimos pedidos en línea de 9:00 a 18:00 hrs.');
    return;
  }
  const nombre = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const notas = document.getElementById('notas').value.trim();

  if (!nombre || !telefono) {
    alert('Por favor completa tu nombre y teléfono.');
    return;
  }

  let ubicacionFinal = ubicacionTexto;
  if (!ubicacionFinal) {
    ubicacionFinal = direccionManualEl.value.trim();
  }
  if (!ubicacionFinal) {
    alert('Comparte tu ubicación o escribe tu dirección para poder entregarte el pedido.');
    return;
  }

  const pedido = {
    cart,
    cliente: { nombre, telefono },
    ubicacionTexto: ubicacionFinal,
    subtotal,
    envio,
    total,
    notas,
  };

  if (metodoPago === 'mercadopago' && mpDisponible) {
    sessionStorage.setItem('chicanito_pending_order', JSON.stringify({ ...pedido, metodoPago: 'Pagado en línea (Mercado Pago) ✅' }));
    try {
      const res = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
        return;
      }
      throw new Error('Sin init_point');
    } catch (e) {
      alert('No se pudo iniciar el pago en línea. Intenta con efectivo/transferencia por ahora.');
      return;
    }
  }

  sessionStorage.setItem('chicanito_pending_order', JSON.stringify({ ...pedido, metodoPago: 'Efectivo o transferencia al recibir' }));
  window.location.href = 'confirmacion.html';
});
