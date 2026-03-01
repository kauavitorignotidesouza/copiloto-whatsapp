/**
 * Roda a migração inicial (drizzle/0000_init.sql) no Neon.
 * Uso: node scripts/run-init-migration.mjs
 * Requer DATABASE_URL em .env.local ou .env
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";

const { Client } = pg;

config({ path: ".env.local" });
config({ path: ".env" });

const DATABASE_URL = (process.env.DATABASE_URL || "").trim().replace(/^["']|["']$/g, "");
if (!DATABASE_URL || !DATABASE_URL.startsWith("postgresql://")) {
  console.error("Erro: DATABASE_URL não definida ou inválida. Configure em .env.local com a connection string do Neon (começa com postgresql://).");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "..", "drizzle", "0000_init.sql");
const fullSql = readFileSync(sqlPath, "utf-8");

const statements = fullSql
  .split(/\n--> statement-breakpoint\n/)
  .map((s) => s.trim())
  .filter(Boolean);

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;
    try {
      await client.query(stmt);
      console.log(`[${i + 1}/${statements.length}] OK`);
    } catch (err) {
      if (err.message && err.message.includes("already exists")) {
        console.log(`[${i + 1}/${statements.length}] Já existe (ignorado)`);
      } else {
        console.error(`[${i + 1}/${statements.length}] Erro:`, err.message);
        throw err;
      }
    }
  }

  await client.end();
  console.log("Migração concluída.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
