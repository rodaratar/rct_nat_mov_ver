import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  const { minX, minY, maxX, maxY, since } = req.query;

  try {
    const result = await pool.query(`
      SELECT id, type, properties,
             ST_AsText(geom) as geom,
             EXTRACT(EPOCH FROM updated_at) as updated_at,
             EXTRACT(EPOCH FROM deleted_at) as deleted_at,
             version
      FROM features
      WHERE geom && ST_MakeEnvelope($1,$2,$3,$4,4326)
        AND (updated_at > to_timestamp($5) OR deleted_at > to_timestamp($5))
    `, [minX, minY, maxX, maxY, since]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}