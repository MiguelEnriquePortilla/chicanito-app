// Función serverless de Vercel: lista los pedidos guardados, para el dashboard
// interno. Protegida por un token compartido (DASHBOARD_TOKEN) que nunca vive
// en el código público — sin el ?key= correcto, no regresa nada.
const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  const token = process.env.DASHBOARD_TOKEN;
  const provided = req.query ? req.query.key : undefined;

  if (!token || provided !== token) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    res.status(200).json({ pedidos: [] });
    return;
  }

  try {
    const sql = neon(databaseUrl);
    await sql`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
        cliente_nombre TEXT,
        cliente_telefono TEXT,
        metodo_entrega TEXT,
        ubicacion TEXT,
        notas TEXT,
        metodo_pago TEXT,
        subtotal NUMERIC,
        envio NUMERIC,
        total NUMERIC,
        items JSONB,
        estado TEXT DEFAULT 'pendiente'
      )
    `;
    await sql`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pendiente'`;
    const rows = await sql`SELECT * FROM pedidos ORDER BY creado_en DESC LIMIT 200`;
    res.status(200).json({ pedidos: rows });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
