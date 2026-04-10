import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL);

console.log("URL:", process.env.POSTGRES_URL); // 👈 para probar

async function seedPoints() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS features_5 (
        id TEXT PRIMARY KEY,
        type TEXT,
        properties JSONB,
        geom JSONB,
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
// node src/seed/seed.js
// node src/index.js





