import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { conversations, contacts } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

function getInitials(name: string | null): string {
  if (!name || !name.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const tenantFilter = eq(conversations.tenantId, tenantId);

  let where = tenantFilter;
  if (status && status !== "all") {
    where = and(tenantFilter, eq(conversations.status, status))!;
  }

  const rows = await db
    .select({
      id: conversations.id,
      contactId: conversations.contactId,
      lastMessagePreview: conversations.lastMessagePreview,
      lastMessageAt: conversations.lastMessageAt,
      unreadCount: conversations.unreadCount,
      status: conversations.status,
      contactName: contacts.name,
      contactProfileName: contacts.profileName,
      contactWaId: contacts.waId,
      windowExpiresAt: conversations.windowExpiresAt,
    })
    .from(conversations)
    .innerJoin(contacts, eq(conversations.contactId, contacts.id))
    .where(where)
    .orderBy(desc(conversations.lastMessageAt));

  let list = rows.map((r) => ({
    id: r.id,
    contactId: r.contactId,
    contactName: r.contactName || r.contactProfileName || "Contato",
    contactPhone: r.contactWaId ?? "",
    lastMessage: r.lastMessagePreview ?? "",
    lastMessageAt: r.lastMessageAt,
    unreadCount: r.unreadCount ?? 0,
    status: r.status,
    avatarInitials: getInitials(r.contactName || r.contactProfileName),
    windowExpiresAt: r.windowExpiresAt,
  }));

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.contactName.toLowerCase().includes(q) ||
        c.contactPhone.includes(q)
    );
  }

  return NextResponse.json({ conversations: list });
}
