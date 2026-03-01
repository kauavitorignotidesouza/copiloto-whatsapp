import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { messages, conversations, tenants, contacts } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { sendWhatsAppText } from "@/lib/whatsapp/send-message";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenantId = (session.user as unknown as { tenantId?: string }).tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 403 });
  }

  const { id: conversationId } = await params;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.tenantId, tenantId)))
    .limit(1);

  if (!conv) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  const list = rows.map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    direction: m.direction,
    type: m.type,
    content: m.content ?? "",
    status: m.status,
    createdAt: m.createdAt,
    isAiGenerated: m.isAiGenerated ?? false,
  }));

  return NextResponse.json({ messages: list });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenantId = (session.user as unknown as { tenantId?: string }).tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 403 });
  }

  const { id: conversationId } = await params;
  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json({ error: "Conteúdo da mensagem é obrigatório" }, { status: 400 });
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.tenantId, tenantId)))
    .limit(1);

  if (!conv) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  const [inserted] = await db
    .insert(messages)
    .values({
      tenantId,
      conversationId,
      direction: "outbound",
      type: (body.type as string) || "text",
      content,
      status: "sent",
      sentById: session.user.id,
      isAiGenerated: Boolean(body.isAiGenerated),
    })
    .returning();

  if (!inserted) {
    return NextResponse.json({ error: "Erro ao salvar mensagem" }, { status: 500 });
  }

  await db
    .update(conversations)
    .set({
      lastMessageAt: inserted.createdAt,
      lastMessagePreview: content.slice(0, 100),
      unreadCount: 0,
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, conv.contactId)).limit(1);

  if (tenant?.whatsappAccessToken && tenant?.whatsappPhoneNumberId && contact?.waId) {
    sendWhatsAppText(tenant.whatsappPhoneNumberId, tenant.whatsappAccessToken, contact.waId, content)
      .then((result) => {
        if (!result.success && result.error) {
          console.error("[WhatsApp send]", result.error);
        }
      })
      .catch((err) => console.error("[WhatsApp send]", err));
  }

  return NextResponse.json(
    {
      message: {
        id: inserted.id,
        conversationId: inserted.conversationId,
        direction: inserted.direction,
        type: inserted.type,
        content: inserted.content,
        status: inserted.status,
        createdAt: inserted.createdAt,
        isAiGenerated: inserted.isAiGenerated ?? false,
      },
    },
    { status: 201 }
  );
}
