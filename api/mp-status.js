// Función serverless de Vercel: indica si Mercado Pago ya está configurado,
// sin exponer la llave secreta al cliente. Mientras MP_ACCESS_TOKEN no exista
// como variable de entorno en Vercel, el checkout se degrada a solo
// efectivo/transferencia sin romperse.
module.exports = (req, res) => {
  const enabled = Boolean(process.env.MP_ACCESS_TOKEN);
  res.status(200).json({ enabled });
};
