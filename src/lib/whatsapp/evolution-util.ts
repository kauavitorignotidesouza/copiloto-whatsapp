export function sanitizeInstanceName(tenantId: string): string {
  return tenantId.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 64) || "tenant";
}

/** Extrai o número (waId) do remoteJid da Evolution: "5511999999999@s.whatsapp.net" -> "5511999999999" */
export function waIdFromRemoteJid(remoteJid: string): string {
  if (!remoteJid) return "";
  const at = remoteJid.indexOf("@");
  return at >= 0 ? remoteJid.slice(0, at) : remoteJid;
}
