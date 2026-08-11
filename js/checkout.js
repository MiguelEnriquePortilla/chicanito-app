// Lógica de la página de checkout: resumen, ubicación, horario y método de pago.

function formatoMoneda(v) {
  return `$${v.toFixed(0)}`;
}

const cart = getCart();
if (cart.length === 0) {
  window.location.href = 'index.html';
}

const subtotal = getSubtotal(cart);
let envio = calcularEnvio();
const total = subtotal;

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

function actualizarResumenEnvio() {
  document.getElementById('summary-envio').textContent = envio === 0 ? 'Gratis' : 'Por confirmar';
  document.getElementById('summary-total').textContent = envio === 0 ? formatoMoneda(total) : `${formatoMoneda(total)} + envío`;
  document.getElementById('summary-envio-nota').style.display = envio === 0 ? 'none' : 'block';
}
actualizarResumenEnvio();

// ---------- Método de entrega ----------
const optDomicilio = document.getElementById('opt-domicilio');
const optRecoger = document.getElementById('opt-recoger');
const ubicacionBlock = document.getElementById('ubicacion-block');
let metodoEntrega = 'domicilio';

function seleccionarEntrega(metodo) {
  metodoEntrega = metodo;
  optDomicilio.classList.toggle('is-selected', metodo === 'domicilio');
  optRecoger.classList.toggle('is-selected', metodo === 'recoger');
  ubicacionBlock.style.display = metodo === 'recoger' ? 'none' : 'block';
  envio = metodo === 'recoger' ? 0 : calcularEnvio();
  actualizarResumenEnvio();
}

optDomicilio.addEventListener('click', () => seleccionarEntrega('domicilio'));
optRecoger.addEventListener('click', () => seleccionarEntrega('recoger'));

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
const optTransferencia = document.getElementById('opt-transferencia');
const optTarjeta = document.getElementById('opt-tarjeta');
const METODO_PAGO_LABELS = {
  efectivo: 'Efectivo contra entrega',
  transferencia: 'Transferencia contra entrega',
  tarjeta: 'Tarjeta contra entrega',
};
let metodoPago = 'efectivo';

function seleccionarPago(metodo) {
  metodoPago = metodo;
  optEfectivo.classList.toggle('is-selected', metodo === 'efectivo');
  optTransferencia.classList.toggle('is-selected', metodo === 'transferencia');
  optTarjeta.classList.toggle('is-selected', metodo === 'tarjeta');
}

optEfectivo.addEventListener('click', () => seleccionarPago('efectivo'));
optTransferencia.addEventListener('click', () => seleccionarPago('transferencia'));
optTarjeta.addEventListener('click', () => seleccionarPago('tarjeta'));

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

  let ubicacionFinal = '';
  if (metodoEntrega === 'domicilio') {
    ubicacionFinal = ubicacionTexto || direccionManualEl.value.trim();
    if (!ubicacionFinal) {
      alert('Comparte tu ubicación o escribe tu dirección para poder entregarte el pedido.');
      return;
    }
  }

  const pedido = {
    cart,
    cliente: { nombre, telefono },
    metodoEntrega,
    ubicacionTexto: ubicacionFinal,
    subtotal,
    envio,
    total,
    notas,
  };

  sessionStorage.setItem('chicanito_pending_order', JSON.stringify({ ...pedido, metodoPago: METODO_PAGO_LABELS[metodoPago] }));
  chicanitoGo('confirmacion.html');
});

document.getElementById('back-to-menu-link').addEventListener('click', (e) => {
  e.preventDefault();
  chicanitoGo('index.html');
});
