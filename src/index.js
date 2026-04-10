const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// PUSH
app.post('/api/sync/push', async (req, res) => {
  const features = req.body;

  try {
    for (const f of features) {
      await pool.query(`
        INSERT INTO features_2 (id, type, properties, geom, updated_at, deleted_at, sync_status, version)
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
        WHERE features_2.version < EXCLUDED.version
      `, [
        f.id, f.type, f.properties, f.geom,
        f.updated_at, f.deleted_at, f.sync_status, f.version
      ]);
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PULL
app.get('/api/sync/pull', async (req, res) => {
  const { minX, minY, maxX, maxY, since } = req.query;

  const result = await pool.query(`
    SELECT id, type, properties,
           ST_AsText(geom) as geom,
           EXTRACT(EPOCH FROM updated_at) as updated_at,
           EXTRACT(EPOCH FROM deleted_at) as deleted_at,
           version
    FROM features_2
    WHERE geom && ST_MakeEnvelope($1,$2,$3,$4,4326)
      AND (updated_at > to_timestamp($5) OR deleted_at > to_timestamp($5))
  `, [minX, minY, maxX, maxY, since]);

  res.json(result.rows);
});

// PUNTOS
app.get('/api/puntos', async (req, res) => {
  const result = await pool.query(`SELECT * FROM features_2 LIMIT 100`);
  res.json(result.rows);
});

module.exports = app;