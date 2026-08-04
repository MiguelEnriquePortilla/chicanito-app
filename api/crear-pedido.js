// Función serverless de Vercel: guarda un pedido confirmado en la base de datos
// (Neon Postgres, vía DATABASE_URL). No bloquea ni rompe el flujo de WhatsApp si
// la base de datos no está configurada o falla — el pedido siempre se puede
// enviar por WhatsApp aunque esto falle.
const { neon } = require('@neondatabase/serverless');

async function asegurarTabla(sql) {
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
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    res.status(200).json({ saved: false, reason: 'DATABASE_URL no configurada' });
    return;
  }

  try {
    const sql = neon(databaseUrl);
    await asegurarTabla(sql);

    const { cliente, metodoEntrega, ubicacionTexto, notas, metodoPago, subtotal, envio, total, cart } = req.body || {};

    await sql`
      INSERT INTO pedidos
        (cliente_nombre, cliente_telefono, metodo_entrega, ubicacion, notas, metodo_pago, subtotal, envio, total, items)
      VALUES
        (${cliente?.nombre || ''}, ${cliente?.telefono || ''}, ${metodoEntrega || ''}, ${ubicacionTexto || ''},
         ${notas || ''}, ${metodoPago || ''}, ${subtotal || 0}, ${envio || 0}, ${total || 0}, ${JSON.stringify(cart || [])})
    `;

    res.status(200).json({ saved: true });
  } catch (e) {
    res.status(200).json({ saved: false, error: String(e) });
  }
};
