// Estado del carrito, persistido en localStorage para que sobreviva entre páginas.
const CART_KEY = 'chicanito_cart_v1';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(item) {
  const cart = getCart();
  cart.push({
    uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    cantidad: 1,
    ...item,
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
  return cart.reduce((sum, it) => sum + it.cantidad, 0);
}
