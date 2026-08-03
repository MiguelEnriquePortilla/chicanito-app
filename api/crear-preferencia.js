// Función serverless de Vercel: crea una preferencia de pago de Mercado Pago
// del lado del servidor, usando MP_ACCESS_TOKEN (variable de entorno privada,
// nunca expuesta al cliente). Requiere que Miguel cree su cuenta de Mercado
// Pago y configure esta variable en el proyecto de Vercel.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(503).json({ error: 'Mercado Pago no está configurado todavía.' });
    return;
  }

  const { total } = req.body || {};
  if (!total || Number(total) <= 0) {
    res.status(400).json({ error: 'Total inválido.' });
    return;
  }

  const origin = `https://${req.headers.host}`;

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: 'Pedido Chicanito',
            quantity: 1,
            unit_price: Number(total),
            currency_id: 'MXN',
          },
        ],
        back_urls: {
          success: `${origin}/confirmacion.html`,
          failure: `${origin}/checkout.html`,
          pending: `${origin}/confirmacion.html`,
        },
        auto_return: 'approved',
      }),
    });

    const data = await mpRes.json();
    if (!mpRes.ok) {
      res.status(502).json({ error: 'Mercado Pago rechazó la solicitud.', detalle: data });
      return;
    }
    res.status(200).json({ init_point: data.init_point });
  } catch (e) {
    res.status(500).json({ error: 'Error al crear la preferencia de pago.' });
  }
};
