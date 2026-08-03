// Lógica de la página de inicio: tabs, tarjetas de menú, selector de variantes y carrito.

const tabsEl = document.getElementById('tabs');
const menuContainerEl = document.getElementById('menu-container');
const hoursBannerEl = document.getElementById('hours-banner');

const variantModal = document.getElementById('variant-modal');
const modalItemName = document.getElementById('modal-item-name');
const modalItemPrice = document.getElementById('modal-item-price');
const modalVariants = document.getElementById('modal-variants');
const modalAddBtn = document.getElementById('modal-add-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

let modalPaquete = null;
let modalSeleccion = {};

function formatoMoneda(v) {
  return `$${v.toFixed(0)}`;
}

// ---------- Render de tabs ----------
function ordenCategorias() {
  const presentes = new Set([...PAQUETES.map((p) => p.categoria), ...A_LA_CARTA.map((a) => a.categoria)]);
  return Object.keys(CATEGORIAS).filter((c) => presentes.has(c));
}

function renderTabs() {
  const categorias = ordenCategorias();
  tabsEl.innerHTML = categorias
    .map((cat, i) => `<button class="tab-btn${i === 0 ? ' is-active' : ''}" data-cat="${cat}" type="button">${CATEGORIAS[cat]}</button>`)
    .join('');

  tabsEl.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const target = document.getElementById(`section-${btn.dataset.cat}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ---------- Render de menú ----------
function renderMenuCard(paquete) {
  return `
    <div class="menu-card">
      <img class="menu-card-img" src="${paquete.imagen}" alt="${paquete.nombre}" loading="lazy">
      <div class="menu-card-body">
        <div class="menu-card-name">${paquete.nombre}</div>
        <div class="menu-card-desc">${paquete.descripcionCorta}</div>
        <div class="menu-card-footer">
          <span class="menu-card-price">${formatoMoneda(paquete.precio)}</span>
          <button class="add-btn" data-id="${paquete.id}" type="button">Agregar</button>
        </div>
      </div>
    </div>
  `;
}

function renderCartaRow(item) {
  const pillsHtml = item.tamanos
    .map((t, i) => `<button class="size-pill${i === 0 ? ' is-active' : ''}" data-idx="${i}" type="button">${t.label} · ${formatoMoneda(t.precio)}</button>`)
    .join('');
  return `
    <div class="carta-row" data-id="${item.id}">
      <div class="carta-row-name">${item.nombre}</div>
      <div class="carta-row-controls">
        <div class="size-pills">${pillsHtml}</div>
        <button class="add-btn" type="button">Agregar</button>
      </div>
    </div>
  `;
}

function renderMenu() {
  const categorias = ordenCategorias();
  menuContainerEl.innerHTML = categorias
    .map((cat) => {
      const paquetes = PAQUETES.filter((p) => p.categoria === cat);
      const carta = A_LA_CARTA.filter((a) => a.categoria === cat);
      const itemsHtml = paquetes.length
        ? `<div class="menu-grid">${paquetes.map(renderMenuCard).join('')}</div>`
        : `<div style="display:flex; flex-direction:column; gap:0.7rem;">${carta.map(renderCartaRow).join('')}</div>`;
      return `
        <section class="menu-section" id="section-${cat}">
          <h2 class="menu-section-title">${CATEGORIAS[cat]}</h2>
          ${itemsHtml}
        </section>
      `;
    })
    .join('');

  // Botones "Agregar" de paquetes (pueden requerir variantes)
  menuContainerEl.querySelectorAll('.menu-card .add-btn').forEach((btn) => {
    btn.addEventListener('click', () => onAddPaquete(btn.dataset.id));
  });

  // Filas a la carta: seleccionar tamaño + agregar
  menuContainerEl.querySelectorAll('.carta-row').forEach((row) => {
    const id = row.dataset.id;
    const item = A_LA_CARTA.find((a) => a.id === id);
    let tamanoIdx = 0;
    row.querySelectorAll('.size-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        row.querySelectorAll('.size-pill').forEach((p) => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        tamanoIdx = Number(pill.dataset.idx);
      });
    });
    row.querySelector('.add-btn').addEventListener('click', () => {
      const tamano = item.tamanos[tamanoIdx];
      addToCart({
        tipo: 'ala_carta',
        refId: item.id,
        nombre: item.nombre,
        precioUnitario: tamano.precio,
        detalleVariantes: tamano.label,
      });
      refreshCartUI();
      flashAdded(row.querySelector('.add-btn'));
    });
  });
}

function flashAdded(btn) {
  const original = btn.textContent;
  btn.textContent = '¡Agregado!';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 900);
}

// ---------- Modal de variantes ----------
function onAddPaquete(id) {
  const paquete = PAQUETES.find((p) => p.id === id);
  if (!paquete.variantes || paquete.variantes.length === 0) {
    addToCart({
      tipo: 'paquete',
      refId: paquete.id,
      nombre: paquete.nombre,
      precioUnitario: paquete.precio,
      detalleVariantes: '',
    });
    refreshCartUI();
    return;
  }
  modalPaquete = paquete;
  modalSeleccion = {};
  modalItemName.textContent = paquete.nombre;
  modalItemPrice.textContent = formatoMoneda(paquete.precio);
  modalVariants.innerHTML = paquete.variantes
    .map(
      (grupo) => `
        <div class="variant-group" data-group="${grupo.id}">
          <div class="variant-group-label">${grupo.label}</div>
          <div class="variant-options">
            ${grupo.opciones.map((op) => `<button class="variant-option" data-value="${op}" type="button">${op}</button>`).join('')}
          </div>
        </div>
      `
    )
    .join('');

  modalVariants.querySelectorAll('.variant-group').forEach((groupEl) => {
    const groupId = groupEl.dataset.group;
    groupEl.querySelectorAll('.variant-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        groupEl.querySelectorAll('.variant-option').forEach((o) => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');
        modalSeleccion[groupId] = opt.dataset.value;
        checkModalComplete();
      });
    });
  });

  modalAddBtn.disabled = true;
  variantModal.classList.remove('hidden');
}

function checkModalComplete() {
  const completo = modalPaquete.variantes.every((g) => modalSeleccion[g.id]);
  modalAddBtn.disabled = !completo;
}

modalAddBtn.addEventListener('click', () => {
  const detalle = modalPaquete.variantes
    .map((g) => `${g.label}: ${modalSeleccion[g.id]}`)
    .join(' · ');
  addToCart({
    tipo: 'paquete',
    refId: modalPaquete.id,
    nombre: modalPaquete.nombre,
    precioUnitario: modalPaquete.precio,
    detalleVariantes: detalle,
  });
  variantModal.classList.add('hidden');
  refreshCartUI();
});

closeModalBtn.addEventListener('click', () => variantModal.classList.add('hidden'));

// ---------- Carrito ----------
const openCartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsEl = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartEnvioEl = document.getElementById('cart-envio');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

function openCart() {
  cartOverlay.classList.remove('hidden');
  cartDrawer.classList.remove('hidden');
  requestAnimationFrame(() => cartDrawer.classList.add('is-open'));
}
function closeCart() {
  cartDrawer.classList.remove('is-open');
  setTimeout(() => {
    cartOverlay.classList.add('hidden');
    cartDrawer.classList.add('hidden');
  }, 250);
}
openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function renderCartItems(cart) {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío. ¡Agrega algo rico!</p>';
    return;
  }
  cartItemsEl.innerHTML = cart
    .map(
      (it) => `
        <div class="cart-item" data-uid="${it.uid}">
          <div class="cart-item-top">
            <span class="cart-item-name">${it.nombre}</span>
            <button class="remove-btn" data-uid="${it.uid}" type="button">Quitar</button>
          </div>
          ${it.detalleVariantes ? `<div class="cart-item-detail">${it.detalleVariantes}</div>` : ''}
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button class="qty-btn" data-uid="${it.uid}" data-delta="-1" type="button">−</button>
              <span>${it.cantidad}</span>
              <button class="qty-btn" data-uid="${it.uid}" data-delta="1" type="button">+</button>
            </div>
            <strong>${formatoMoneda(it.precioUnitario * it.cantidad)}</strong>
          </div>
        </div>
      `
    )
    .join('');

  cartItemsEl.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.uid);
      refreshCartUI();
    });
  });
  cartItemsEl.querySelectorAll('.qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cart = getCart();
      const item = cart.find((it) => it.uid === btn.dataset.uid);
      const delta = Number(btn.dataset.delta);
      if (item.cantidad + delta <= 0) {
        removeFromCart(item.uid);
      } else {
        updateCantidad(item.uid, item.cantidad + delta);
      }
      refreshCartUI();
    });
  });
}

function refreshCartUI() {
  const cart = getCart();
  cartCountEl.textContent = getCartCount(cart);
  renderCartItems(cart);
  const subtotal = getSubtotal(cart);
  const envio = cart.length ? calcularEnvio(subtotal) : 0;
  cartSubtotalEl.textContent = formatoMoneda(subtotal);
  cartEnvioEl.textContent = envio === 0 ? 'Gratis' : formatoMoneda(envio);
  cartTotalEl.textContent = formatoMoneda(subtotal + envio);
  checkoutBtn.disabled = cart.length === 0;
}

checkoutBtn.addEventListener('click', () => {
  if (getCart().length === 0) return;
  window.location.href = 'checkout.html';
});

// ---------- Horario ----------
function renderHoursBanner() {
  hoursBannerEl.style.display = estaAbierto() ? 'none' : 'block';
}

// ---------- Init ----------
renderTabs();
renderMenu();
refreshCartUI();
renderHoursBanner();
