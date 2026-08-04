// Lógica del dashboard interno: pide los pedidos guardados, muestra un resumen
// del día, y permite marcar cada pedido como pendiente/entregado/cancelado.
// Protegido por ?key= en la URL, validado del lado del servidor (api/pedidos.js).

function formatoMoneda(v) {
  return `$${Number(v).toFixed(0)}`;
}

function formatoFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

function resumenItems(items) {
  if (!Array.isArray(items)) return '';
  return items
    .map((it) => `${it.cantidad}x ${it.nombre}${it.detalleVariantes ? ` (${it.detalleVariantes})` : ''}`)
    .join('; ');
}

const params = new URLSearchParams(window.location.search);
const key = params.get('key') || '';
const subEl = document.getElementById('dash-sub');
const contentEl = document.getElementById('dash-content');
const summaryEl = document.getElementById('dash-summary');
const summaryCountEl = document.getElementById('dash-summary-count');
const summaryTotalEl = document.getElementById('dash-summary-total');
const summaryPendientesEl = document.getElementById('dash-summary-pendientes');

function renderResumenHoy(pedidos) {
  const hoy = new Date().toLocaleDateString('es-MX');
  const pedidosHoy = pedidos.filter((p) => new Date(p.creado_en).toLocaleDateString('es-MX') === hoy);
  const totalHoy = pedidosHoy.reduce((sum, p) => sum + Number(p.total || 0), 0);
  const pendientesHoy = pedidosHoy.filter((p) => (p.estado || 'pendiente') === 'pendiente').length;

  summaryCountEl.textContent = pedidosHoy.length;
  summaryTotalEl.textContent = formatoMoneda(totalHoy);
  summaryPendientesEl.textContent = pendientesHoy;
  summaryEl.style.display = pedidos.length ? 'flex' : 'none';
}

function actualizarEstado(id, estado, selectEl) {
  selectEl.classList.remove('estado-pendiente', 'estado-entregado', 'estado-cancelado');
  selectEl.classList.add(`estado-${estado}`);
  fetch('/api/actualizar-pedido', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, id, estado }),
  })
    .then((r) => r.json())
    .then(() => cargarPedidos())
    .catch(() => {});
}

function renderTabla(pedidos) {
  contentEl.innerHTML = `
    <table class="dash-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Teléfono</th>
          <th>Entrega</th>
          <th>Ubicación / Notas</th>
          <th>Pedido</th>
          <th>Total</th>
          <th>Pago</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${pedidos
          .map((p) => {
            const estado = p.estado || 'pendiente';
            return `
              <tr>
                <td>${formatoFecha(p.creado_en)}</td>
                <td>${p.cliente_nombre || ''}</td>
                <td>${p.cliente_telefono || ''}</td>
                <td><span class="dash-pill">${p.metodo_entrega === 'recoger' ? 'Recoger en tienda' : 'A domicilio'}</span></td>
                <td>${p.ubicacion || ''}${p.notas ? `<br><em>${p.notas}</em>` : ''}</td>
                <td class="dash-items">${resumenItems(p.items)}</td>
                <td class="dash-total">${formatoMoneda(p.total)}</td>
                <td>${p.metodo_pago || ''}</td>
                <td>
                  <select class="dash-estado estado-${estado}" data-id="${p.id}">
                    <option value="pendiente"${estado === 'pendiente' ? ' selected' : ''}>Pendiente</option>
                    <option value="entregado"${estado === 'entregado' ? ' selected' : ''}>Entregado</option>
                    <option value="cancelado"${estado === 'cancelado' ? ' selected' : ''}>Cancelado</option>
                  </select>
                </td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;

  contentEl.querySelectorAll('.dash-estado').forEach((sel) => {
    sel.addEventListener('change', () => actualizarEstado(sel.dataset.id, sel.value, sel));
  });
}

function cargarPedidos() {
  return fetch(`/api/pedidos?key=${encodeURIComponent(key)}`)
    .then((r) => {
      if (r.status === 401) throw new Error('denied');
      return r.json();
    })
    .then((data) => {
      const pedidos = data.pedidos || [];
      subEl.textContent = `${pedidos.length} pedido${pedidos.length === 1 ? '' : 's'} en total`;

      if (pedidos.length === 0) {
        summaryEl.style.display = 'none';
        contentEl.innerHTML = '<p class="dash-empty">Todavía no hay pedidos guardados.</p>';
        return;
      }

      renderResumenHoy(pedidos);
      renderTabla(pedidos);
    })
    .catch(() => {
      subEl.textContent = '';
      summaryEl.style.display = 'none';
      contentEl.innerHTML = '<p class="dash-denied">Acceso denegado. Verifica el link.</p>';
    });
}

cargarPedidos();
