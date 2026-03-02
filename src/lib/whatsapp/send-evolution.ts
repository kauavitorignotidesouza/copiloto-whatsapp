import { sanitizeInstanceName } from "./evolution-util";

/**
 * Envia uma mensagem de texto via Evolution API.
 * Requer EVOLUTION_API_URL e EVOLUTION_API_KEY configurados no .env.
 */
export async function sendEvolutionText(
  tenantId: string,
  toWaId: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;

  if (!baseUrl || !apiKey) {
    return { success: false, error: "Evolution API não configurada" };
  }

  const instanceName = sanitizeInstanceName(tenantId);
  const number = toWaId.replace(/\D/g, "");

  // Tenta múltiplos paths da API (compatibilidade com diferentes versões)
  const paths = ["", "/api", "/v1"];

  for (const prefix of paths) {
    const url = `${baseUrl}${prefix}/message/sendText/${instanceName}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify({ number, text }),
        signal: AbortSignal.timeout(15000),
      });

      if (res.status === 404) continue; // Tenta próximo path

      const data = (await res.json()) as Record<string, unknown>;

      if (!res.ok) {
        const errMsg = typeof data.message === "string" ? data.message : `HTTP ${res.status}`;
        return { success: false, error: errMsg };
      }

      const key = data.key as Record<string, unknown> | undefined;
      const messageId = key?.id as string | undefined;
      return { success: true, messageId };
    } catch (err) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        return { success: false, error: "Timeout ao enviar mensagem" };
      }
      // Se não é 404, é outro erro - não tenta próximo path
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("404")) {
        return { success: false, error: message };
      }
    }
  }

  return { success: false, error: "Nenhum endpoint Evolution API encontrado" };
}
