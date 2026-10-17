// Estado del carrito, persistido en localStorage para que sobreviva entre páginas.
const CART_KEY = 'chicanito_cart_v1';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) return [];
    if (cart.some(it=>it.menuVersion !== MENU_VERSION)) {
      localStorage.setItem('chicanito_menu_changed','1');
      localStorage.setItem(CART_KEY,'[]');
      return [];
    }
    return applyPromotion(cart.filter(it=>it.tipo!=='paquete'||productoDisponible(PAQUETES.find(p=>p.id===it.refId))));
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart.filter((it) => it.tipo !== 'promocion')));
}

function addToCart(item) {
  const cart = getCart();
  cart.push({
    uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    cantidad: 1,
    ...item,
    menuVersion: MENU_VERSION,
  });
  saveCart(cart);
  return cart;
}

function removeFromCart(uid) {
  const cart = getCart().filter((it) => it.uid !== uid);
  saveCart(cart);
  return cart;
}

function updateCantidad(uid, cantidad) {
  const cart = getCart();
  const item = cart.find((it) => it.uid === uid);
  if (item) {
    item.cantidad = Math.max(1, cantidad);
    saveCart(cart);
  }
  return cart;
}

function clearCart() {
  saveCart([]);
}

function getSubtotal(cart) {
  return cart.reduce((sum, it) => sum + it.precioUnitario * it.cantidad, 0);
}

function getCartCount(cart) {
  return cart.filter((it) => it.tipo !== 'promocion').reduce((sum, it) => sum + it.cantidad, 0);
}
