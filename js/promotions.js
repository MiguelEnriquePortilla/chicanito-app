// Campañas por temporada. Fechas inclusivas en la zona horaria del negocio.
// Agrega la campaña siguiente aquí; no se repite septiembre en años futuros.
const CAMPAIGNS = [
  {
    id: 'noviembre-2026', startsOn: '2026-11-01', endsOn: '2026-11-30',
    title: 'Noviembre con N de NO PARAMOS',
    message: 'Gajos Bravas Habaneras GRATIS en la compra de 12 piezas CRUJI o ROSTI. Pide por la app. Válido todo NOVIEMBRE 2026.',
    productId: 'noviembre-2026', ctaLabel: 'Ver promo', ctaAction: 'show-promo',
    productIds: ['paquete-3', 'paquete-4', 'cruji-jueves'],
    giftName: 'Gajos Bravas Habaneras GRATIS',
    giftDetail: '250 g por paquete de 12 piezas. Sazón seco de habanero, paprika y toque cítrico. Promo noviembre 2026.',
  },
  {
    id: 'octubre-2026', startsOn: '2026-10-08', endsOn: '2026-10-31',
    title: '¡Sin miedito, pide con piloncito!',
    message: '12 piezas crujientes con salsa de la casa por $229. ¡250 g de papas gajo GRATIS! Exclusivo por la app hasta el 31 de octubre.',
    productId: 'cruji-pilon-octubre-2026', ctaLabel: 'Pedir promo de $229', ctaAction: 'add-to-cart',
  },
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
  const campaign = activeCampaign(now);
  const paidItems = cart.filter((item) => item.tipo !== 'promocion' &&
    (item.refId !== 'cruji-pilon-octubre-2026' || campaign?.id === 'octubre-2026'))
    .map((item) => item.refId === 'cruji-pilon-octubre-2026' ? {
      ...item, nombre: 'Cruji con pilón · 12 piezas crujientes', precioUnitario: 229,
      detalleVariantes: 'Salsa de la casa + 250 g de papas gajo GRATIS por paquete',
    } : item);
  if (campaign?.id === 'noviembre-2026') {
    const cantidad = paidItems.reduce((sum, item) => sum + (
      item.tipo === 'paquete' && campaign.productIds.includes(item.refId) && item.cantidad > 0
        ? item.cantidad : 0), 0);
    return cantidad ? [...paidItems, {
      uid: `promo-${campaign.id}`, tipo: 'promocion', refId: campaign.id,
      nombre: campaign.giftName, cantidad, precioUnitario: 0,
      detalleVariantes: campaign.giftDetail,
    }] : paidItems;
  }
  if (!campaign || !campaign.giftName || !paidItems.some((item) =>
    item.tipo === 'paquete' && item.refId === campaign.productId && item.cantidad > 0
  )) return paidItems;
  return [...paidItems, {
    uid: `promo-${campaign.id}`, tipo: 'promocion', refId: campaign.id,
    nombre: campaign.giftName, cantidad: 1, precioUnitario: 0,
    detalleVariantes: campaign.giftDetail || '',
  }];
}

// Producto independiente: el paquete habitual conserva precio y guarniciones.
function refreshSeasonalProducts() {
  if (typeof PAQUETES === 'undefined') return;
  const index = PAQUETES.findIndex((p) => p.id === 'cruji-pilon-octubre-2026');
  if (index >= 0) PAQUETES.splice(index, 1);
  if (activeCampaign()?.id === 'octubre-2026') PAQUETES.unshift({
    id: 'cruji-pilon-octubre-2026', categoria: 'crujientes',
    nombre: 'Cruji con pilón · 12 piezas', precio: 229,
    caption: '¡250 g de papas gajo GRATIS!',
    descripcionCorta: '12 piezas crujientes con salsa de la casa + 250 g de papas gajo gratis. Solo por la app, hasta el 31 de octubre de 2026.',
    imagen: 'assets/menu/cruji-pilon-octubre-2026.png', variantes: [],
  });
}
refreshSeasonalProducts();
