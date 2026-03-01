import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import QRCode from "qrcode";
import { sanitizeInstanceName } from "@/lib/whatsapp/evolution-util";

const EVOLUTION_URL = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const FETCH_TIMEOUT_MS = 15000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = FETCH_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...fetchOptions, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

function parseJsonSafe(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function setWebhookIfConfigured(
  baseUrl: string,
  instanceName: string,
  headers: Record<string, string>
): Promise<void> {
  const webhookBase =
    process.env.EVOLUTION_WEBHOOK_BASE || process.env.NEXT_PUBLIC_APP_URL || "";
  const webhookUrl =
    webhookBase && !webhookBase.includes("localhost")
      ? `${webhookBase.replace(/\/$/, "")}/api/webhooks/evolution`
      : null;
  if (!webhookUrl) return;
  try {
    await fetchWithTimeout(
      `${baseUrl}/webhook/set/${encodeURIComponent(instanceName)}`,
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
      }
    );
  } catch (_) {}
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenantId = (session.user as unknown as { tenantId?: string }).tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 403 });
  }

  if (!EVOLUTION_URL || !EVOLUTION_API_KEY) {
    return NextResponse.json({
      available: false,
      message:
        "Configure EVOLUTION_API_URL e EVOLUTION_API_KEY nas variáveis de ambiente (servidor Evolution API) para usar conexão por QR.",
    });
  }

  const instanceName = sanitizeInstanceName(tenantId);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: EVOLUTION_API_KEY,
  };

  const basePaths = ["", "/api", "/v1"];
  let lastError = "";

  for (const base of basePaths) {
    const baseUrl = base ? `${EVOLUTION_URL}${base}` : EVOLUTION_URL;
    const connectUrl = `${baseUrl}/instance/connect/${encodeURIComponent(instanceName)}`;
    const createUrl = `${baseUrl}/instance/create`;

    try {
      const connectRes = await fetchWithTimeout(connectUrl, { method: "GET", headers });

      if (connectRes.status === 404) {
        const createRes = await fetchWithTimeout(createUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            instanceName,
            integration: "WHATSAPP-BAILEYS",
            qrcode: true,
          }),
        });

        const createText = await createRes.text();
        if (!createRes.ok) {
          lastError = `Criar instância (${baseUrl}): ${createRes.status} - ${createText.slice(0, 200)}`;
          continue;
        }

        await setWebhookIfConfigured(baseUrl, instanceName, headers);

        const connectRetry = await fetchWithTimeout(connectUrl, { method: "GET", headers });
        const data = parseJsonSafe(await connectRetry.text());
        if (data) {
          const base64 = await qrFromResponse(data);
          return NextResponse.json({
            available: true,
            base64,
            pairingCode: (data.pairingCode as string) ?? null,
            code: (data.code as string) ?? null,
            status: (data.status as string) ?? "connecting",
          });
        }
        lastError = `Connect após create: resposta não é JSON (${connectRetry.status})`;
        continue;
      }

      if (!connectRes.ok) {
        const text = await connectRes.text();
        const data = parseJsonSafe(text);
        const msg = data?.message ?? data?.error ?? text?.slice(0, 150);
        lastError = `Connect (${baseUrl}): ${connectRes.status} - ${String(msg)}`;
        continue;
      }

      const text = await connectRes.text();
      const data = parseJsonSafe(text);
      if (data) {
        const base64 = await qrFromResponse(data);
        await setWebhookIfConfigured(baseUrl, instanceName, headers);
        return NextResponse.json({
          available: true,
          base64,
          pairingCode: (data.pairingCode as string) ?? null,
          code: (data.code as string) ?? null,
          status: (data.status as string) ?? "connecting",
        });
      }
      lastError = `Resposta não é JSON (${connectRes.status})`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("abort")) {
        lastError = `Timeout ao conectar em ${connectUrl}`;
      } else {
        lastError = `${baseUrl}: ${msg}`;
      }
    }
  }

  console.error("[whatsapp/qr]", lastError);
  return NextResponse.json({
    available: true,
    error: lastError || "Não foi possível falar com a Evolution API. Verifique a URL, a porta e a apikey.",
  });
}

async function qrFromResponse(data: Record<string, unknown>): Promise<string | null> {
  let base64 = (data.base64 as string) ?? (data.qrcode as Record<string, unknown>)?.base64 as string | undefined;
  if (base64) return base64;
  const code = data.code as string | undefined;
  if (code) {
    try {
      return await QRCode.toDataURL(code, { margin: 2, width: 280 });
    } catch (_) {}
  }
  return null;
}
