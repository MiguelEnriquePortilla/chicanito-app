// Campañas por temporada. Fechas inclusivas en la zona horaria del negocio.
// Agrega la campaña siguiente aquí; no se repite septiembre en años futuros.
const CAMPAIGNS = [
  {
    id: 'septiembre-2026',
    startsOn: '2026-09-01',
    endsOn: '2026-09-30',
    title: 'Septiembre: ¡tu tercera pieza va gratis!',
    message: 'Pide un Dúo y recibe una tercera pieza crujiente sin costo extra. Aplica a un Dúo por pedido.',
    productId: 'paquete-9',
    ctaLabel: 'Ver Dúo',
    giftName: 'Pieza crujiente gratis · Promo de septiembre',
    giftDetail: 'Tercera pieza sin costo extra. Aplica a un Dúo por pedido.',
  },
];

function activeCampaign(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type) => parts.find((p) => p.type === type).value;
  const date = `${part('year')}-${part('month')}-${part('day')}`;
  return CAMPAIGNS.find((c) => c.startsOn <= date && date <= c.endsOn) || null;
}

// Derivar el regalo evita duplicarlo al recargar o cambiar cantidades.
function applyPromotion(cart, now = new Date()) {
  const paidItems = cart.filter((item) => item.tipo !== 'promocion');
  const campaign = activeCampaign(now);
  if (!campaign || !campaign.giftName || !paidItems.some((item) =>
    item.tipo === 'paquete' && item.refId === campaign.productId && item.cantidad > 0
  )) return paidItems;
  return [...paidItems, {
    uid: `promo-${campaign.id}`, tipo: 'promocion', refId: campaign.id,
    nombre: campaign.giftName, cantidad: 1, precioUnitario: 0,
    detalleVariantes: campaign.giftDetail || '',
  }];
}
