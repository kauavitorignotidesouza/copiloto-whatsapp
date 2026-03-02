import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const VALID_STATUSES = ["open", "waiting", "closed", "archived"] as const;

export async function PATCH(
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

  const { id } = await params;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Status inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }
    updates.status = body.status;

    if (body.status === "closed") {
      updates.closedAt = new Date();
      updates.closedById = session.user.id;
    }
  }

  if (body.assignedUserId !== undefined) {
    updates.assignedToId = body.assignedUserId;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Nenhum campo válido para atualizar" },
      { status: 400 }
    );
  }

  updates.updatedAt = new Date();

  const [updated] = await db
    .update(conversations)
    .set(updates)
    .where(and(eq(conversations.id, id), eq(conversations.tenantId, tenantId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ conversation: updated });
}

export async function DELETE(
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

  const { id } = await params;

  // Verify the conversation exists and belongs to this tenant
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.tenantId, tenantId)))
    .limit(1);

  if (!conv) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  // Delete all messages belonging to this conversation first
  await db
    .delete(messages)
    .where(eq(messages.conversationId, id));

  // Delete the conversation itself
  await db
    .delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.tenantId, tenantId)));

  return NextResponse.json({ deleted: true });
}
