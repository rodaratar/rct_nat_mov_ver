import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL);

console.log("URL:", process.env.POSTGRES_URL); // 👈 para probar

async function seedPoints() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS features (
        id TEXT PRIMARY KEY,
        type TEXT,
        properties JSONB,
        geom GEOMETRY(Point, 4326),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ,
        sync_status TEXT DEFAULT 'pending',
        version INTEGER DEFAULT 1
      );
    `;

    console.log("✅ Tabla creada correctamente");
  } catch (error) {
    console.error("❌ Error creando la tabla:", error);
  }
}

seedPoints();

// para crear la tabla
// node src/seed/createTable.js
// node src/index.js





