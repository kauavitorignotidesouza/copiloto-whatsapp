/**
 * Envia uma mensagem de texto via WhatsApp Cloud API.
 * Requer tenant com whatsappAccessToken e whatsappPhoneNumberId configurados.
 */
export async function sendWhatsAppText(
  phoneNumberId: string,
  accessToken: string,
  toWaId: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toWaId.replace(/\D/g, ""),
    type: "text",
    text: { body: text },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as { messages?: Array<{ id: string }>; error?: { message: string } };

    if (!res.ok) {
      return { success: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }

    const messageId = data.messages?.[0]?.id;
    return { success: true, messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
