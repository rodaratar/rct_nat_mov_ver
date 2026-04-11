import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL);

async function insertData() {
  try {
    await sql`
      INSERT INTO features_6 (id, type, geom)
      VALUES (
        '1',
        'point',
        ST_SetSRID(ST_MakePoint(-77.03, -12.04), 4326)
      )
      ON CONFLICT (id)
      DO UPDATE SET
        geom = EXCLUDED.geom,
        updated_at = NOW();
    `;

    console.log("✅ Dato insertado");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sql.end();
  }
}

insertData();

// node src/seed/insertData.js