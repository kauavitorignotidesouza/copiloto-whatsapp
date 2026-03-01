import { NextResponse } from "next/server";
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
    return NextResponse.json({ connected: false, state: "unconfigured" });
  }

  const instanceName = sanitizeInstanceName(tenantId);
  try {
    const res = await fetch(
      `${EVOLUTION_URL}/instance/connectionState/${encodeURIComponent(instanceName)}`,
      {
        method: "GET",
        headers: { apikey: EVOLUTION_API_KEY },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (res.status === 404) {
      return NextResponse.json({ connected: false, state: "not_found" });
    }

    if (!res.ok) {
      return NextResponse.json({ connected: false, state: "error" });
    }

    const data = (await res.json()) as { instance?: { state?: string } };
    const state = data?.instance?.state ?? "close";
    const connected = state === "open";

    return NextResponse.json({ connected, state });
  } catch {
    return NextResponse.json({ connected: false, state: "error" });
  }
}
