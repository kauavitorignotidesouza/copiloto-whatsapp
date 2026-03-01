import { neon as neonNetlify } from "@netlify/neon";
import { neon as neonServerless } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  if (process.env.NETLIFY_DATABASE_URL) {
    const sql = neonNetlify();
    return drizzle(sql, { schema });
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não está definida. No Netlify, conecte o banco pela integração Neon. Localmente, configure DATABASE_URL no .env.local."
    );
  }
  const sql = neonServerless(connectionString);
  return drizzle(sql, { schema });
}

function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_, prop) {
    return (getDb() as unknown as Record<string, unknown>)[prop as string];
  },
});

export type Database = ReturnType<typeof createDb>;
export { schema };
