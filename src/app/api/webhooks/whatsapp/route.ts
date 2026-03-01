import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants, contacts, conversations, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { calculateWindowExpiry } from "@/lib/whatsapp/24h-window";

const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "change-me";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge || "", { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const entries = body.entry ?? [];
    for (const entry of entries) {
      const changes = entry.changes ?? [];
      for (const change of changes) {
        if (change.field !== "messages") continue;

        const value = change.value;
        const metadata = value.metadata ?? {};
        const phoneNumberId = String(metadata.phone_number_id ?? "");

        if (!phoneNumberId) continue;

        const [tenant] = await db
          .select()
          .from(tenants)
          .where(eq(tenants.whatsappPhoneNumberId, phoneNumberId))
          .limit(1);

        if (!tenant) continue;

        const incomingMessages = value.messages ?? [];
        const profileName = value.contacts?.[0]?.profile?.name ?? null;

        for (const msg of incomingMessages) {
          const fromWaId = String(msg.from ?? "");
          const waMessageId = msg.id ?? null;
          const type = (msg.type ?? "text") as string;
          const textBody = msg.text?.body ?? msg.caption ?? "";
          const content = type === "text" ? textBody : type === "image" || type === "video" || type === "document" ? `[${type}] ${textBody || "(sem legenda)"}`.trim() : `[${type}]`;

          let [contact] = await db
            .select()
            .from(contacts)
            .where(and(eq(contacts.tenantId, tenant.id), eq(contacts.waId, fromWaId)))
            .limit(1);

          let contactId: string;
          if (contact) {
            contactId = contact.id;
            if (profileName && contact.profileName !== profileName) {
              await db.update(contacts).set({ profileName, updatedAt: new Date() }).where(eq(contacts.id, contactId));
            }
          } else {
            contactId = createId();
            await db.insert(contacts).values({
              id: contactId,
              tenantId: tenant.id,
              waId: fromWaId,
              profileName: profileName ?? undefined,
            });
          }

          const [existingConv] = await db
            .select()
            .from(conversations)
            .where(and(eq(conversations.tenantId, tenant.id), eq(conversations.contactId, contactId)))
            .limit(1);

          let conversationId: string;
          if (existingConv) {
            conversationId = existingConv.id;
            const windowExpiresAt = calculateWindowExpiry(new Date());
            await db
              .update(conversations)
              .set({
                lastMessageAt: new Date(),
                lastMessagePreview: content.slice(0, 100),
                unreadCount: (existingConv.unreadCount ?? 0) + 1,
                windowExpiresAt,
                updatedAt: new Date(),
              })
              .where(eq(conversations.id, conversationId));
          } else {
            conversationId = createId();
            const windowExpiresAt = calculateWindowExpiry(new Date());
            await db.insert(conversations).values({
              id: conversationId,
              tenantId: tenant.id,
              contactId,
              lastMessageAt: new Date(),
              lastMessagePreview: content.slice(0, 100),
              unreadCount: 1,
              windowExpiresAt,
            });
          }

          await db.insert(messages).values({
            tenantId: tenant.id,
            conversationId,
            waMessageId,
            direction: "inbound",
            type,
            content: content || null,
            status: "delivered",
          });
        }

        const statuses = value.statuses ?? [];
        for (const status of statuses) {
          const msgId = status.id;
          const statusValue = status.status;
          const [existingMsg] = await db.select().from(messages).where(eq(messages.waMessageId, msgId)).limit(1);
          if (existingMsg) {
            await db.update(messages).set({ status: statusValue }).where(eq(messages.id, existingMsg.id));
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Webhook WhatsApp]", error);
    return NextResponse.json({ status: "ok" });
  }
}
