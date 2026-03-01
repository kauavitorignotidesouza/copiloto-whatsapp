import { neon as neonNetlify } from "@netlify/neon";
import { neon as neonServerless } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function getDb() {
  // Netlify: usa a integração Neon (NETLIFY_DATABASE_URL é definida automaticamente)
  if (process.env.NETLIFY_DATABASE_URL) {
    const sql = neonNetlify();
    return drizzle(sql, { schema });
  }

  // Local: usa DATABASE_URL do .env.local (ex.: connection string do Neon)
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não está definida. No Netlify, conecte o banco pela integração Neon (netlify db init). Localmente, configure DATABASE_URL no .env.local."
    );
  }
  const sql = neonServerless(connectionString);
  return drizzle(sql, { schema });
}

export const db = getDb();
export type Database = ReturnType<typeof getDb>;
export { schema };
