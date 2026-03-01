import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { conversations, contacts, messages } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenantId = (session.user as unknown as { tenantId?: string }).tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 403 });
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_GENERATIVE_AI_API_KEY não configurada. Configure nas variáveis de ambiente." },
      { status: 503 }
    );
  }

  let body: { conversationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const conversationId = body.conversationId;
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId é obrigatório" }, { status: 400 });
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.tenantId, tenantId)))
    .limit(1);

  if (!conv) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  const [contact] = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, conv.contactId))
    .limit(1);

  const recentMessages = await db
    .select({ content: messages.content, direction: messages.direction })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(20);

  const context = recentMessages
    .reverse()
    .map((m) => (m.direction === "inbound" ? `Cliente: ${m.content ?? ""}` : `Atendente: ${m.content ?? ""}`))
    .join("\n");

  const contactName = contact?.name || contact?.profileName || "Cliente";

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: `Você é um assistente de vendas e suporte no WhatsApp. Analise a conversa e responda APENAS com um JSON válido, sem markdown, no formato:
{"intent":"compra|suporte|preço|reclamação|geral|agendamento|pagamento|opt-out","confidence":0.0 a 1.0,"suggestions":[{"text":"texto da sugestão","tone":"friendly|neutral|formal","confidence":0.0 a 1.0}]}
Gere 1 a 3 sugestões de resposta curtas em português do Brasil. Se não houver mensagens, use intent "geral" e uma saudação.`,
      prompt: `Conversa com ${contactName}:\n\n${context || "(Nenhuma mensagem ainda)"}\n\nResponda só com o JSON.`,
    });

    const raw = text.trim().replace(/^```json?\s*|\s*```$/g, "");
    const parsed = JSON.parse(raw) as {
      intent: string;
      confidence: number;
      suggestions: Array<{ text: string; tone: string; confidence: number }>;
    };

    const suggestions = (parsed.suggestions || []).slice(0, 3).map((s, i) => ({
      id: `s-${i + 1}`,
      text: s.text || "",
      tone: (s.tone || "neutral") as "friendly" | "neutral" | "formal",
      confidence: typeof s.confidence === "number" ? s.confidence : 0.8,
    }));

    return NextResponse.json({
      intent: parsed.intent || "geral",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      suggestions,
    });
  } catch (err) {
    console.error("[copilot/suggestions]", err);
    return NextResponse.json(
      { error: "Erro ao gerar sugestões. Verifique a GOOGLE_GENERATIVE_AI_API_KEY." },
      { status: 500 }
    );
  }
}
