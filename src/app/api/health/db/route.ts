import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * GET /api/health/db
 * Testa se a conexão com o banco (Neon) está funcionando.
 * Use local: http://localhost:3000/api/health/db
 * Use produção: https://seu-site.netlify.app/api/health/db
 */
export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({
      ok: true,
      database: "connected",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[health/db]", message);

    return NextResponse.json(
      {
        ok: false,
        database: "error",
        error: message,
      },
      { status: 503 }
    );
  }
}
