// Función serverless de Vercel: marca un pedido como entregado/cancelado/pendiente.
// Protegida por el mismo DASHBOARD_TOKEN que api/pedidos.js.
const { neon } = require('@neondatabase/serverless');

const ESTADOS_VALIDOS = ['pendiente', 'entregado', 'cancelado'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const token = process.env.DASHBOARD_TOKEN;
  const { key, id, estado } = req.body || {};

  if (!token || key !== token) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }
  if (!id || !ESTADOS_VALIDOS.includes(estado)) {
    res.status(400).json({ error: 'Datos inválidos' });
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    res.status(200).json({ updated: false });
    return;
  }

  try {
    const sql = neon(databaseUrl);
    await sql`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pendiente'`;
    await sql`UPDATE pedidos SET estado = ${estado} WHERE id = ${id}`;
    res.status(200).json({ updated: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
