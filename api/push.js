import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  const features = req.body;

  try {
    for (const f of features) {
      await pool.query(`
        INSERT INTO features (id, type, properties, geom, updated_at, deleted_at, sync_status, version)
        VALUES (
          $1,$2,$3,
          ST_GeomFromText($4, 4326),
          to_timestamp($5::double precision),
          to_timestamp($6::double precision),
          $7,$8
        )
        ON CONFLICT (id)
        DO UPDATE SET
          properties = EXCLUDED.properties,
          geom = EXCLUDED.geom,
          updated_at = EXCLUDED.updated_at,
          deleted_at = EXCLUDED.deleted_at,
          sync_status = EXCLUDED.sync_status,
          version = EXCLUDED.version
        WHERE features.version < EXCLUDED.version
      `, [
        f.id, f.type, f.properties, f.geom,
        f.updated_at, f.deleted_at, f.sync_status, f.version
      ]);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}