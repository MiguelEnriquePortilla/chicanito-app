// Campañas por temporada. Fechas inclusivas en la zona horaria del negocio.
// Agrega la campaña siguiente aquí; no se repite septiembre en años futuros.
const CAMPAIGNS = [
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

function businessDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type) => parts.find((p) => p.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

const CRUJI_DIP_FLAVORS = ['Diablo Chicanito', 'BBQ JOJUTOWN', 'Limón Pimienta',
  'Ranch Jalapeño', 'Miel Picante', 'Buffalo', 'Parmesano'];

function isCrujiDipPromotion(now = new Date()) {
  const date = businessDate(now);
  return '2026-11-01' <= date && date <= '2026-11-30';
}

function activeCampaign(now = new Date()) {
  const date = businessDate(now);
  return CAMPAIGNS.find((c) => c.startsOn <= date && date <= c.endsOn) || null;
}

// Derivar el regalo evita duplicarlo al recargar o cambiar cantidades.
function applyPromotion(cart, now = new Date()) {
  const items = applySeasonalPromotion(cart, now);
  if (!isCrujiDipPromotion(now)) return items;
  const quantities = new Map();
  for (const item of items) {
    if (item.tipo !== 'paquete' || item.refId !== 'paquete-4' ||
        !CRUJI_DIP_FLAVORS.includes(item.crujiDip) || !(item.cantidad > 0)) continue;
    quantities.set(item.crujiDip, (quantities.get(item.crujiDip) || 0) + item.cantidad);
  }
  return [...items, ...Array.from(quantities, ([flavor, cantidad]) => ({
    uid: `promo-crujidip-${CRUJI_DIP_FLAVORS.indexOf(flavor)}`,
    tipo: 'promocion', refId: 'crujidip-noviembre-2026',
    nombre: `CrujiDip mediano (4 oz) GRATIS · ${flavor}`, cantidad, precioUnitario: 0,
    detalleVariantes: 'Uno por Cruji Doce. Válido hasta el 30 de noviembre de 2026.',
  }))];
}

function applySeasonalPromotion(cart, now = new Date()) {
  const campaign = activeCampaign(now);
  const paidItems = cart.filter((item) => item.tipo !== 'promocion' &&
    (item.refId !== 'cruji-pilon-octubre-2026' || campaign?.id === 'octubre-2026') &&
    !item.refId?.startsWith('bravas-') &&
    !(item.tipo === 'paquete' && item.precioUnitario === 229 &&
      ['paquete-3', 'paquete-4'].includes(item.refId)))
    .map((item) => item.refId === 'cruji-pilon-octubre-2026' ? {
      ...item, nombre: 'Cruji con pilón · 12 piezas crujientes', precioUnitario: 229,
      detalleVariantes: 'Salsa de la casa + 250 g de papas gajo GRATIS por paquete',
    } : { ...item });
  if (!campaign || !campaign.giftName || !paidItems.some((item) =>
    item.tipo === 'paquete' && item.refId === campaign.productId && item.cantidad > 0
  )) return paidItems;
  return [...paidItems, {
    uid: `promo-${campaign.id}`, tipo: 'promocion', refId: campaign.id,
    nombre: campaign.giftName, cantidad: 1, precioUnitario: 0,
    detalleVariantes: campaign.giftDetail || '',
  }];
}

// Actualizar las ofertas del catálogo según su vigencia.
function refreshSeasonalProducts(now = new Date()) {
  if (typeof PAQUETES === 'undefined') return;
  const campaign = activeCampaign(now);
  const doce = PAQUETES.find(p => p.id === 'paquete-4');
  if (doce) {
    doce.variantes = doce.variantes.filter(g => g.id !== 'crujiDip');
    doce.caption = '';
    doce.imagen = 'assets/menu/octubre-2026/cruji-doce-254-45x80-qr.png';
    doce.descripcionCorta = '12 piezas, salsa grande y papas gajo grandes.';
    if (isCrujiDipPromotion(now)) {
      doce.variantes.push({id: 'crujiDip', label: 'CrujiDip mediano (4 oz) GRATIS a elegir', opciones: CRUJI_DIP_FLAVORS});
      doce.caption = 'CrujiDip mediano (4 oz) GRATIS a elegir';
      doce.descripcionCorta += ' Promoción válida hasta el 30 de noviembre de 2026.';
    }
  }
  const index = PAQUETES.findIndex((p) => p.id === 'cruji-pilon-octubre-2026');
  if (index >= 0) PAQUETES.splice(index, 1);
  if (campaign?.id === 'octubre-2026') PAQUETES.unshift({
    id: 'cruji-pilon-octubre-2026', categoria: 'crujientes',
    nombre: 'Cruji con pilón · 12 piezas', precio: 229,
    caption: '¡250 g de papas gajo GRATIS!',
    descripcionCorta: '12 piezas crujientes con salsa de la casa + 250 g de papas gajo gratis. Solo por la app, hasta el 31 de octubre de 2026.',
    imagen: 'assets/menu/cruji-pilon-octubre-2026.png', variantes: [],
  });
}
refreshSeasonalProducts();
