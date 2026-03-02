import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL não está definida. Configure no .env.local com a connection string do Supabase."
  );
}

// prepare: false é necessário para Supabase em modo transaction/pooler
// ssl: 'require' para Supabase pooler
const client = postgres(connectionString, { prepare: false, ssl: "require" });
export const db = drizzle(client, { schema });

export type Database = typeof db;
export { schema };
