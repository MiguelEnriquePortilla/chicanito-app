// Lógica de la página de inicio: feed estilo TikTok, tabs, complementos a la carta y carrito.

const topBarEl = document.getElementById('top-bar');
const tabsEl = document.getElementById('tabs');
const feedContainerEl = document.getElementById('feed-container');
const alacartaContainerEl = document.getElementById('alacarta-container');
const hoursBannerEl = document.getElementById('hours-banner');
const heartBurstEl = document.getElementById('heart-burst');
const toastEl = document.getElementById('toast');

function formatoMoneda(v) {
  return `$${v.toFixed(0)}`;
}

function mostrarToast(mensaje) {
  toastEl.textContent = mensaje;
  toastEl.classList.add('is-visible');
  setTimeout(() => toastEl.classList.remove('is-visible'), 2000);
}

function ajustarAlturaTopBar() {
  document.documentElement.style.setProperty('--topbar-h', `${topBarEl.offsetHeight}px`);
}
window.addEventListener('resize', ajustarAlturaTopBar);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(ajustarAlturaTopBar);
}

// ---------- Categorías presentes ----------
function categoriasPaquetes() {
  const presentes = new Set(PAQUETES.map((p) => p.categoria));
  return Object.keys(CATEGORIAS).filter((c) => presentes.has(c) && c !== 'complementos' && c !== 'salsas');
}
function categoriasALaCarta() {
  const presentes = new Set(A_LA_CARTA.map((a) => a.categoria));
  return Object.keys(CATEGORIAS).filter((c) => presentes.has(c) && (c === 'complementos' || c === 'salsas'));
}

// ---------- Tabs ----------
// Mueve el scroll DENTRO de #feed-container únicamente, sin tocar el scroll
// de la página exterior (scrollIntoView normal a veces también mueve la
// página exterior cuando el objetivo vive en una caja de scroll anidada,
// desalineando todo contra el header fijo).
function scrollFeedCardIntoView(cardEl) {
  const containerRect = feedContainerEl.getBoundingClientRect();
  const cardRect = cardEl.getBoundingClientRect();
  const delta = cardRect.top - containerRect.top;
  feedContainerEl.scrollTo({ top: feedContainerEl.scrollTop + delta, behavior: 'auto' });
}

function renderTabs() {
  const todas = [...categoriasPaquetes(), ...categoriasALaCarta()];
  tabsEl.innerHTML = todas
    .map((cat, i) => `<button class="tab-btn${i === 0 ? ' is-active' : ''}" data-cat="${cat}" type="button">${CATEGORIAS[cat]}</button>`)
    .join('');

  tabsEl.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const cat = btn.dataset.cat;
      if (cat === 'complementos' || cat === 'salsas') {
        document.getElementById(`alacarta-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const primerPaquete = PAQUETES.find((p) => p.categoria === cat);
      const cardEl = primerPaquete && document.getElementById(`feed-${primerPaquete.id}`);
      if (cardEl) {
        scrollFeedCardIntoView(cardEl);
      }
    });
  });
}

// ---------- Separadores entre paquetes ----------
const FEED_DIVIDER_TAGLINES = [
  'Very Sabrosito 🐔',
  'Recién hecho para ti 🔥',
  'El sabor que ya conoces 💙',
  'Directo del carrito a tu casa 🛵',
];

function renderFeedDivider(index) {
  const tagline = FEED_DIVIDER_TAGLINES[index % FEED_DIVIDER_TAGLINES.length];
  return `
    <div class="feed-divider">
      <img src="assets/brand/chicanito-mascot-cutout.png" alt="Chicanito" class="feed-divider-mascot">
      <span class="feed-divider-text">${tagline}</span>
    </div>
  `;
}

// ---------- Feed de paquetes ----------
function renderFeed() {
  feedContainerEl.innerHTML = PAQUETES.map(
    (p, i) => `
      <article class="feed-card" id="feed-${p.id}" data-id="${p.id}">
        <img class="feed-card-img" src="${p.imagen}" alt="${p.nombre}" loading="${i === 0 ? 'eager' : 'lazy'}">
        <div class="feed-card-gradient"></div>
        <div class="feed-card-content">
          <span class="feed-card-category">${CATEGORIAS[p.categoria]}</span>
          <h2 class="feed-card-name">${p.nombre}</h2>
          ${p.caption ? `<p class="feed-card-caption">${p.caption}</p>` : ''}
          <p class="feed-card-desc">${p.descripcionCorta}</p>
          <p class="feed-card-price"><span>${formatoMoneda(p.precio)}</span></p>
        </div>
        <div class="feed-card-actions">
          <button class="feed-action-btn heart-btn" data-id="${p.id}" type="button" aria-label="Agregar al carrito">
            <span class="icon heart-icon">🤍</span>
            <span class="heart-count">0</span>
          </button>
          <button class="feed-action-btn share-btn" data-id="${p.id}" type="button" aria-label="Compartir">
            <span class="icon">🔗</span>
            <span>Compartir</span>
          </button>
        </div>
      </article>
      ${i < PAQUETES.length - 1 ? renderFeedDivider(i) : ''}
    `
  ).join('');

  feedContainerEl.querySelectorAll('.heart-btn').forEach((btn) => {
    btn.addEventListener('click', () => onHeartTap(btn.dataset.id, btn));
  });
  feedContainerEl.querySelectorAll('.share-btn').forEach((btn) => {
    btn.addEventListener('click', () => onShare(btn.dataset.id));
  });
  feedContainerEl.querySelectorAll('.feed-card-img').forEach((img) => {
    img.addEventListener('dblclick', () => {
      const id = img.closest('.feed-card').dataset.id;
      onHeartTap(id);
      dispararHeartBurst();
    });
  });
}

function dispararHeartBurst() {
  heartBurstEl.classList.remove('is-bursting');
  // Forzar reflow para reiniciar la animación si se dispara varias veces seguidas.
  void heartBurstEl.offsetWidth;
  heartBurstEl.classList.add('is-bursting');
}

// ---------- Animación "vuela al carrito" al agregar un producto ----------
function punchCart() {
  openCartBtn.classList.remove('is-pulsing');
  void openCartBtn.offsetWidth;
  openCartBtn.classList.add('is-pulsing');
  cartCountEl.classList.remove('is-popping');
  void cartCountEl.offsetWidth;
  cartCountEl.classList.add('is-popping');
}

function flyToCart(originEl) {
  if (!originEl || typeof originEl.animate !== 'function') {
    punchCart();
    return;
  }
  const originRect = originEl.getBoundingClientRect();
  const targetRect = openCartBtn.getBoundingClientRect();
  const chip = document.createElement('div');
  chip.className = 'fly-chip';
  chip.textContent = '✓';
  chip.style.left = `${originRect.left + originRect.width / 2 - 13}px`;
  chip.style.top = `${originRect.top + originRect.height / 2 - 13}px`;
  document.body.appendChild(chip);

  const dx = targetRect.left + targetRect.width / 2 - (originRect.left + originRect.width / 2);
  const dy = targetRect.top + targetRect.height / 2 - (originRect.top + originRect.height / 2);

  const anim = chip.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(1.1)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0, offset: 1 },
    ],
    { duration: 550, easing: 'cubic-bezier(0.3, 0.8, 0.4, 1)' }
  );
  anim.onfinish = () => {
    chip.remove();
    punchCart();
  };
}

// ---------- Agregar al carrito desde el corazón ----------
let modalPaquete = null;
let modalSeleccion = {};

const variantModal = document.getElementById('variant-modal');
const modalItemName = document.getElementById('modal-item-name');
const modalItemPrice = document.getElementById('modal-item-price');
const modalVariants = document.getElementById('modal-variants');
const modalAddBtn = document.getElementById('modal-add-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

function onHeartTap(id, originEl) {
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
    flyToCart(originEl || feedContainerEl.querySelector(`.heart-btn[data-id="${id}"]`));
    return;
  }
  abrirModalVariantes(paquete);
}

function abrirModalVariantes(paquete) {
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
  const detalle = modalPaquete.variantes.map((g) => `${g.label}: ${modalSeleccion[g.id]}`).join(' · ');
  addToCart({
    tipo: 'paquete',
    refId: modalPaquete.id,
    nombre: modalPaquete.nombre,
    precioUnitario: modalPaquete.precio,
    detalleVariantes: detalle,
  });
  flyToCart(modalAddBtn); // medir posición antes de ocultar el modal
  variantModal.classList.add('hidden');
  refreshCartUI();
});

closeModalBtn.addEventListener('click', () => variantModal.classList.add('hidden'));

// ---------- Compartir ----------
async function onShare(id) {
  const paquete = PAQUETES.find((p) => p.id === id);
  const texto = `🐔 ${paquete.nombre} — ${formatoMoneda(paquete.precio)} en Chicken Chicanito. ¡Pídelo aquí!`;
  const url = window.location.href.split('#')[0];

  if (navigator.share) {
    try {
      await navigator.share({ title: paquete.nombre, text: texto, url });
    } catch (e) {
      // El usuario canceló el share nativo; no hacemos nada.
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(`${texto} ${url}`);
    mostrarToast('Link copiado. ¡Compártelo donde quieras!');
  } catch (e) {
    mostrarToast('No se pudo copiar el link.');
  }
}

// ---------- Corazones: reflejar cuántos de cada paquete hay en el carrito ----------
function refreshFeedHearts() {
  const cart = getCart();
  PAQUETES.forEach((p) => {
    const cantidad = cart
      .filter((it) => it.tipo === 'paquete' && it.refId === p.id)
      .reduce((sum, it) => sum + it.cantidad, 0);
    const btn = feedContainerEl.querySelector(`.heart-btn[data-id="${p.id}"]`);
    if (!btn) return;
    btn.classList.toggle('is-active', cantidad > 0);
    btn.querySelector('.heart-icon').textContent = cantidad > 0 ? '❤️' : '🤍';
    btn.querySelector('.heart-count').textContent = cantidad;
  });
}

// ---------- A la carta (complementos y salsas) ----------
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

function renderALaCarta() {
  const categorias = categoriasALaCarta();
  alacartaContainerEl.innerHTML = categorias
    .map((cat) => {
      const items = A_LA_CARTA.filter((a) => a.categoria === cat);
      return `
        <section class="menu-section" id="alacarta-${cat}">
          <h2 class="menu-section-title">${CATEGORIAS[cat]}</h2>
          <div style="display:flex; flex-direction:column; gap:0.7rem;">${items.map(renderCartaRow).join('')}</div>
        </section>
      `;
    })
    .join('');

  alacartaContainerEl.querySelectorAll('.carta-row').forEach((row) => {
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
      flyToCart(row.querySelector('.add-btn'));
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
  refreshFeedHearts();
}

checkoutBtn.addEventListener('click', () => {
  if (getCart().length === 0) return;
  chicanitoGo('checkout.html');
});

// ---------- Horario ----------
function renderHoursBanner() {
  hoursBannerEl.style.display = estaAbierto() ? 'none' : 'block';
  ajustarAlturaTopBar();
}

// ---------- Init ----------
renderTabs();
renderFeed();
renderALaCarta();
refreshCartUI();
renderHoursBanner();
ajustarAlturaTopBar();
