/**
 * Cria um tenant e usuário admin padrão para primeiro acesso.
 * Uso: npm run db:seed
 * Credenciais: admin@exemplo.com / 123456
 */
import { config } from "dotenv";
import { createId } from "@paralleldrive/cuid2";
import { hash } from "bcryptjs";
import pg from "pg";

const { Client } = pg;

config({ path: ".env.local" });
config({ path: ".env" });

const DATABASE_URL = (process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || "").trim().replace(/^["']|["']$/g, "");
if (!DATABASE_URL || !DATABASE_URL.startsWith("postgresql://")) {
  console.error("Defina DATABASE_URL em .env.local (connection string do Neon).");
  process.exit(1);
}

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const tenantId = createId();
  const userId = createId();
  const passwordHash = await hash("123456", 10);

  const tenantRes = await client.query("SELECT id FROM tenants WHERE slug = $1 LIMIT 1", ["empresa-demo"]);
  const tid = tenantRes.rows[0]?.id ?? tenantId;
  if (tenantRes.rows.length === 0) {
    await client.query(
      "INSERT INTO tenants (id, name, slug) VALUES ($1, $2, $3)",
      [tid, "Empresa Demo", "empresa-demo"]
    );
  }

  const userRes = await client.query("SELECT id FROM users WHERE email = $1 LIMIT 1", ["admin@exemplo.com"]);
  if (userRes.rows.length > 0) {
    console.log("Usuário admin@exemplo.com já existe. Nada a fazer.");
    await client.end();
    process.exit(0);
  }

  await client.query(
    "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)",
    [userId, tid, "Admin", "admin@exemplo.com", passwordHash, "admin"]
  );

  await client.end();
  console.log("Seed concluído. Login: admin@exemplo.com / 123456");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
