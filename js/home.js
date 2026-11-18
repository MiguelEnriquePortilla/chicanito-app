// Lógica de la página de inicio: feed estilo TikTok, tabs, complementos a la carta y carrito.

const topBarEl = document.getElementById('top-bar');
const tabsEl = document.getElementById('tabs');
const feedContainerEl = document.getElementById('feed-container');
const alacartaContainerEl = document.getElementById('alacarta-container');
const hoursBannerEl = document.getElementById('hours-banner');
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
function scrollFeedCardIntoView(cardEl) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  cardEl.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}

function renderTabs() {
  const todas = [...categoriasPaquetes(), ...categoriasALaCarta()];
  const mobileLabels = {
    crujientes: 'Cruji',
    rostizados: 'Rosti',
    costillas: 'Costi',
    complementos: 'Extras',
    salsas: 'Salsas',
  };
  tabsEl.innerHTML = todas
    .map((cat, i) => `<button class="tab-btn${i === 0 ? ' is-active' : ''}" data-cat="${cat}" type="button" aria-label="${CATEGORIAS[cat]}">
      <span class="tab-label-full">${CATEGORIAS[cat]}</span><span class="tab-label-mobile">${mobileLabels[cat] || CATEGORIAS[cat]}</span>
    </button>`)
    .join('');

  tabsEl.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const cat = btn.dataset.cat;
      if (cat === 'complementos' || cat === 'salsas') {
        const section = document.getElementById(`alacarta-${cat}`);
        if (section) scrollFeedCardIntoView(section);
        return;
      }
      const section = document.getElementById(`menu-${cat}`);
      if (section) scrollFeedCardIntoView(section);
    });
  });
}

function renderFeed() {
  const dipBanner = isCrujiDipPromotion() ? `
    <div class="crujidip-banner">
      <button id="crujidip-banner-btn" type="button" aria-label="Elegir Cruji Doce de $254 con CrujiDip mediano de 4 oz gratis">
        <img src="assets/menu/crujidip-gratis-4oz-banner.webp" width="1536" height="1024" alt="">
        <span>Elegir Cruji Doce &middot; $254</span>
      </button>
    </div>
  ` : '';
  const renderPackage = (p) => `
    <article class="catalog-item" id="feed-${p.id}" data-id="${p.id}">
      <img src="${p.imagen}" alt="" loading="lazy" width="60" height="76">
      <div class="catalog-copy">
        <h3>${p.nombre}</h3>
        ${p.caption ? `<p class="feed-card-caption">${p.caption}</p>` : ''}
        <p class="catalog-description">${p.descripcionCorta}</p>
        <strong class="catalog-price">${formatoMoneda(p.precio)}</strong>
        <button class="catalog-share" type="button" aria-label="Compartir ${p.nombre}">Compartir</button>
        ${p.soloJueves ? '<small>Solo jueves</small>' : ''}
      </div>
      <div class="catalog-actions">
        <button class="catalog-minus" type="button" aria-label="Quitar una unidad de ${p.nombre}" disabled>&minus;</button>
        <span class="heart-count">0</span>
        <button class="heart-btn catalog-plus" data-id="${p.id}" type="button" aria-label="Agregar ${p.nombre}" ${productoDisponible(p) ? '' : 'disabled'}>+</button>
      </div>
    </article>
  `;
  feedContainerEl.innerHTML = `
    <section class="catalog-intro${dipBanner ? ' has-promo' : ''}">
      <div>
        <h1>Arma tu pedido</h1>
        <p>Elige tus favoritos, revisa el total y envía tu pedido por WhatsApp.</p>
      </div>
      ${dipBanner}
    </section>
    ${categoriasPaquetes().map(cat => `
      <section class="catalog-section" id="menu-${cat}">
        <h2>${CATEGORIAS[cat]}</h2>
        <div class="catalog-grid">${PAQUETES.filter(p => p.categoria === cat).map(renderPackage).join('')}</div>
      </section>
    `).join('')}
  `;

  feedContainerEl.querySelector('#crujidip-banner-btn')?.addEventListener('click', () => {
    if (!isCrujiDipPromotion()) {
      renderSeasonalBanner();
      return;
    }
    onHeartTap('paquete-4');
  });
  feedContainerEl.querySelectorAll('.heart-btn').forEach((btn) => {
    btn.addEventListener('click', () => onHeartTap(btn.dataset.id));
  });
  feedContainerEl.querySelectorAll('.catalog-share').forEach((btn) => {
    btn.addEventListener('click', () => onShare(btn.closest('.catalog-item').dataset.id));
  });
  feedContainerEl.querySelectorAll('.catalog-minus').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.catalog-item').dataset.id;
      const items = getCart().filter(item => item.tipo === 'paquete' && item.refId === id);
      if (items.length > 1) {
        openCart();
        return;
      }
      const item = items[0];
      if (!item) return;
      if (item.cantidad === 1) removeFromCart(item.uid);
      else updateCantidad(item.uid, item.cantidad - 1);
      refreshCartUI();
    });
  });
  refreshFeedHearts();

}

// ---------- Selector de variantes ----------
let modalPaquete = null;
let modalSeleccion = {};
let modalCartUid = null;
const variantModal = document.getElementById('variant-modal');
const modalItemName = document.getElementById('modal-item-name');
const modalItemPrice = document.getElementById('modal-item-price');
const modalVariants = document.getElementById('modal-variants');
const modalAddBtn = document.getElementById('modal-add-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

function onHeartTap(id) {
  const paquete = PAQUETES.find((p) => p.id === id);
  if (!productoDisponible(paquete)) { mostrarToast('Este producto solo está disponible los jueves.'); return; }
  if (!paquete.variantes || paquete.variantes.length === 0) {
    addToCart({
      tipo: 'paquete',
      refId: paquete.id,
      nombre: paquete.nombre,
      precioUnitario: paquete.precio,
      detalleVariantes: paquete.detalleFijo || '',
    });
    refreshCartUI();
    return;
  }
  abrirModalVariantes(paquete);
}

function abrirModalVariantes(paquete, cartUid = null) {
  refreshSeasonalProducts();
  modalCartUid = cartUid;
  modalPaquete = paquete;
  modalSeleccion = {};
  modalItemName.textContent = paquete.nombre;
  modalAddBtn.textContent = cartUid ? 'Guardar elección' : 'Agregar al carrito';
  modalItemPrice.textContent = formatoMoneda(paquete.precio);
  modalVariants.innerHTML = paquete.variantes
    .map(
      (grupo) => `
        <div class="variant-group" data-group="${grupo.id}">
          <div class="variant-group-label">${grupo.label}</div>
          <div class="variant-options">
            ${grupo.opciones.map((op) => `<button class="variant-option" data-value="${op}" type="button">${op}${grupo.recargos?.[op] ? ` (+${formatoMoneda(grupo.recargos[op])})` : ''}</button>`).join('')}
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
  modalItemPrice.textContent = formatoMoneda(precioSeleccion(modalPaquete, modalSeleccion));
}

modalAddBtn.addEventListener('click', () => {
  refreshSeasonalProducts();
  if (!modalPaquete.variantes.every(g => modalSeleccion[g.id])) return;
  const detalle = modalPaquete.variantes.filter(g => g.id !== 'crujiDip')
    .map((g) => `${g.label}: ${modalSeleccion[g.id]}`).join(' · ');
  const selectedItem = {
    tipo: 'paquete',
    refId: modalPaquete.id,
    nombre: modalPaquete.nombre,
    precioUnitario: precioSeleccion(modalPaquete, modalSeleccion),
    detalleVariantes: detalle,
    crujiDip: isCrujiDipPromotion() && modalPaquete.id === 'paquete-4' ? modalSeleccion.crujiDip : undefined,
  };
  if (modalCartUid) {
    saveCart(getCart().map(item => item.uid === modalCartUid ? {...item, ...selectedItem} : item));
  } else {
    addToCart(selectedItem);
  }
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
    const items = cart.filter(item => item.tipo === 'paquete' && item.refId === p.id);
    const cantidad = items.reduce((sum, item) => sum + item.cantidad, 0);
    const btn = feedContainerEl.querySelector(`.heart-btn[data-id="${p.id}"]`);
    if (!btn) return;
    const card = btn.closest('.catalog-item');
    card.querySelector('.heart-count').textContent = cantidad;
    const minus = card.querySelector('.catalog-minus');
    minus.disabled = cantidad === 0;
    const hasChoices = items.length > 1;
    minus.setAttribute('aria-label', hasChoices ? `Revisar opciones de ${p.nombre} en el carrito` : `Quitar una unidad de ${p.nombre}`);
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
const reviewOrderBtn = document.getElementById('review-order-btn');

reviewOrderBtn.addEventListener('click', openCart);

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
      (it) => it.tipo === 'promocion' ? `
        <div class="cart-item promo-gift" role="status">
          <strong>${it.cantidad}x ${it.nombre} · $0</strong>
          <p>${it.detalleVariantes}</p>
        </div>
      ` : `
        <div class="cart-item" data-uid="${it.uid}">
          <div class="cart-item-top">
            <span class="cart-item-name">${it.nombre}</span>
            <button class="remove-btn" data-uid="${it.uid}" type="button">Quitar</button>
          </div>
          ${it.detalleVariantes ? `<div class="cart-item-detail">${it.detalleVariantes}</div>` : ''}
          ${isCrujiDipPromotion() && it.refId === 'paquete-4' ? `<button type="button" class="btn dip-choice-btn" data-uid="${it.uid}">${CRUJI_DIP_FLAVORS.includes(it.crujiDip) ? 'Cambiar CrujiDip gratis' : 'Elegir CrujiDip gratis'}</button>` : ''}
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

  cartItemsEl.querySelectorAll('.dip-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeCart();
      abrirModalVariantes(PAQUETES.find(p => p.id === 'paquete-4'), btn.dataset.uid);
    });
  });
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
  const count = getCartCount(cart);
  cartCountEl.textContent = count;
  renderCartItems(cart);
  const subtotal = getSubtotal(cart);
  const envio = cart.length ? calcularEnvio() : 0;
  cartSubtotalEl.textContent = formatoMoneda(subtotal);
  const orderSubtotal = document.getElementById('order-subtotal');
  const subtotalText = formatoMoneda(subtotal);
  if (orderSubtotal.textContent !== subtotalText) {
    orderSubtotal.textContent = subtotalText;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      orderSubtotal.getAnimations().forEach(animation => animation.cancel());
      orderSubtotal.animate([{ transform: 'translateY(3px)' }, { transform: 'translateY(0)' }], {
        duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)',
      });
    }
  }
  document.getElementById('order-count').textContent = count ? `${count} ${count === 1 ? 'producto' : 'productos'}` : 'Sin productos';
  reviewOrderBtn.disabled = !count;
  cartEnvioEl.textContent = envio === 0 ? 'Gratis' : 'Por confirmar';
  cartTotalEl.textContent = envio === 0 ? formatoMoneda(subtotal) : `${formatoMoneda(subtotal)} + envío`;
  document.getElementById('cart-envio-nota').style.display = envio === 0 ? 'none' : 'block';
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
if (localStorage.getItem('chicanito_menu_changed')) {
 mostrarToast('Actualizamos el menú. Vuelve a agregar tus productos con los precios nuevos.');
 localStorage.removeItem('chicanito_menu_changed');
}
ajustarAlturaTopBar();

// El banner vuelve a mostrarse al abrir el inicio; la campaña controla su vigencia.
function renderSeasonalBanner() {
  const previous = PAQUETES[0]?.id;
  refreshSeasonalProducts();
  const dipCaption = PAQUETES.find(p => p.id === 'paquete-4')?.caption;
  const renderedCaption = document.querySelector('#feed-paquete-4 .feed-card-caption')?.textContent;
  if (previous !== PAQUETES[0]?.id || (dipCaption || '') !== (renderedCaption || '')) {
    renderTabs();
    renderFeed();
  }
  const campaign = activeCampaign();
  const banner = document.getElementById('seasonal-banner');
  banner.hidden = !campaign;
  if (campaign) {
    document.getElementById('seasonal-title').textContent = campaign.title;
    document.getElementById('seasonal-message').textContent = campaign.message;
    document.getElementById('seasonal-cta').textContent = campaign.ctaLabel || 'Ver producto';
    document.getElementById('seasonal-cta').onclick = () => {
      const currentCampaign = activeCampaign();
      if (currentCampaign?.id !== campaign.id) {
        renderSeasonalBanner();
        refreshCartUI();
        return;
      }
      if (campaign.ctaAction === 'add-to-cart') {
        onHeartTap(campaign.productId);
        const paquete = PAQUETES.find((p) => p.id === campaign.productId);
        if (!paquete.variantes?.length) openCart();
        return;
      }
      const card = document.getElementById(`feed-${campaign.productId}`);
      if (card) {
        scrollFeedCardIntoView(card);
        card.querySelector('.heart-btn')?.focus({ preventScroll: true });
      }
    };
  }
  ajustarAlturaTopBar();
}
renderSeasonalBanner();
window.addEventListener('pageshow', () => { renderSeasonalBanner(); refreshCartUI(); });
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) { renderSeasonalBanner(); refreshCartUI(); }
});
