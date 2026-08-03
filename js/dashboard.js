// Lógica del dashboard interno: pide los pedidos guardados y los muestra en una tabla.
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

fetch(`/api/pedidos?key=${encodeURIComponent(key)}`)
  .then((r) => {
    if (r.status === 401) {
      throw new Error('denied');
    }
    return r.json();
  })
  .then((data) => {
    const pedidos = data.pedidos || [];
    subEl.textContent = `${pedidos.length} pedido${pedidos.length === 1 ? '' : 's'}`;

    if (pedidos.length === 0) {
      contentEl.innerHTML = '<p class="dash-empty">Todavía no hay pedidos guardados.</p>';
      return;
    }

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
          </tr>
        </thead>
        <tbody>
          ${pedidos
            .map(
              (p) => `
                <tr>
                  <td>${formatoFecha(p.creado_en)}</td>
                  <td>${p.cliente_nombre || ''}</td>
                  <td>${p.cliente_telefono || ''}</td>
                  <td><span class="dash-pill">${p.metodo_entrega === 'recoger' ? 'Recoger en tienda' : 'A domicilio'}</span></td>
                  <td>${p.ubicacion || ''}${p.notas ? `<br><em>${p.notas}</em>` : ''}</td>
                  <td class="dash-items">${resumenItems(p.items)}</td>
                  <td class="dash-total">${formatoMoneda(p.total)}</td>
                  <td>${p.metodo_pago || ''}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    `;
  })
  .catch(() => {
    subEl.textContent = '';
    contentEl.innerHTML = '<p class="dash-denied">Acceso denegado. Verifica el link.</p>';
  });
