// Ayuda a que la navegación entre páginas (index -> checkout -> confirmación)
// se sienta como una transición, no un salto seco: hace fade-out del body
// antes de cambiar de página. Uso: chicanitoGo('checkout.html').
function chicanitoGo(href) {
  document.body.classList.add('is-leaving');
  setTimeout(() => {
    window.location.href = href;
  }, 190);
}
