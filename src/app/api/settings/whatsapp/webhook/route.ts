import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { sanitizeInstanceName } from "@/lib/whatsapp/evolution-util";

const EVOLUTION_URL = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenantId = (session.user as unknown as { tenantId?: string }).tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 403 });
  }

  if (!EVOLUTION_URL || !EVOLUTION_API_KEY) {
    return NextResponse.json({ configured: false, message: "Evolution API não configurada" });
  }

  const instanceName = sanitizeInstanceName(tenantId);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: EVOLUTION_API_KEY,
  };

  const paths = ["", "/api", "/v1"];
  for (const prefix of paths) {
    try {
      const res = await fetch(
        `${EVOLUTION_URL}${prefix}/webhook/find/${encodeURIComponent(instanceName)}`,
        { method: "GET", headers, signal: AbortSignal.timeout(10000) }
      );
      if (res.status === 404) continue;
      if (!res.ok) continue;

      const data = await res.json();
      return NextResponse.json({
        configured: true,
        url: data?.url ?? data?.webhook?.url ?? null,
        enabled: data?.enabled ?? data?.webhook?.enabled ?? false,
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ configured: false, url: null });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenantId = (session.user as unknown as { tenantId?: string }).tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 403 });
  }

  if (!EVOLUTION_URL || !EVOLUTION_API_KEY) {
    return NextResponse.json({ error: "Evolution API não configurada" }, { status: 400 });
  }

  const body = await request.json();
  const webhookUrl = typeof body.url === "string" ? body.url.trim() : "";

  if (!webhookUrl) {
    return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
  }

  const instanceName = sanitizeInstanceName(tenantId);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: EVOLUTION_API_KEY,
  };

  const paths = ["", "/api", "/v1"];
  for (const prefix of paths) {
    try {
      const res = await fetch(
        `${EVOLUTION_URL}${prefix}/webhook/set/${encodeURIComponent(instanceName)}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            enabled: true,
            url: webhookUrl,
            webhookByEvents: false,
            webhookBase64: false,
            events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"],
          }),
          signal: AbortSignal.timeout(10000),
        }
      );

      if (res.status === 404) continue;

      const data = await res.json();
      if (!res.ok) {
        const msg = typeof data?.message === "string" ? data.message : `HTTP ${res.status}`;
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      return NextResponse.json({ success: true, url: webhookUrl });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("404")) {
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }
  }

  return NextResponse.json(
    { error: "Instância não encontrada na Evolution API. Gere o QR Code primeiro." },
    { status: 404 }
  );
}
