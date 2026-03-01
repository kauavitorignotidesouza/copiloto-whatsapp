import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants, contacts, conversations, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { sanitizeInstanceName, waIdFromRemoteJid } from "@/lib/whatsapp/evolution-util";
import { calculateWindowExpiry } from "@/lib/whatsapp/24h-window";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      event?: string;
      instance?: string;
      data?: {
        key?: { remoteJid?: string; fromMe?: boolean; id?: string };
        pushName?: string;
        message?: { conversation?: string; extendedTextMessage?: { text?: string } };
        messageType?: string;
      };
    };

    const event = body?.event;
    const instanceName = body?.instance;

    if (!instanceName) {
      return NextResponse.json({ received: true });
    }

    const tenantList = await db.select({ id: tenants.id }).from(tenants);
    const tenant = tenantList.find((t) => sanitizeInstanceName(t.id) === instanceName);
    if (!tenant) {
      return NextResponse.json({ received: true });
    }

    if (event === "connection.update") {
      return NextResponse.json({ received: true });
    }

    if (event !== "messages.upsert") {
      return NextResponse.json({ received: true });
    }

    const data = body.data;
    const key = data?.key;
    if (!key) return NextResponse.json({ received: true });

    const remoteJid = String(key.remoteJid ?? "");
    const fromMe = Boolean(key.fromMe);
    const waMessageId = key.id ?? null;
    const waId = waIdFromRemoteJid(remoteJid);
    if (!waId) return NextResponse.json({ received: true });

    const msg = data?.message;
    const content =
      typeof msg?.conversation === "string"
        ? msg.conversation
        : typeof msg?.extendedTextMessage?.text === "string"
          ? msg.extendedTextMessage.text
          : msg && typeof msg === "object"
            ? "[mensagem]"
            : "";
    const messageType = (data?.messageType as string) ?? "text";
    const profileName = data?.pushName ?? null;

    let [contact] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.tenantId, tenant.id), eq(contacts.waId, waId)))
      .limit(1);

    let contactId: string;
    if (contact) {
      contactId = contact.id;
      if (profileName && contact.profileName !== profileName) {
        await db
          .update(contacts)
          .set({ profileName, updatedAt: new Date() })
          .where(eq(contacts.id, contactId));
      }
    } else {
      contactId = createId();
      await db.insert(contacts).values({
        id: contactId,
        tenantId: tenant.id,
        waId,
        profileName: profileName ?? undefined,
      });
    }

    const [existingConv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.tenantId, tenant.id),
          eq(conversations.contactId, contactId)
        )
      )
      .limit(1);

    const now = new Date();
    const windowExpiresAt = calculateWindowExpiry(now);
    const preview = content.slice(0, 100);

    let conversationId: string;
    if (existingConv) {
      conversationId = existingConv.id;
      await db
        .update(conversations)
        .set({
          lastMessageAt: now,
          lastMessagePreview: preview,
          unreadCount: fromMe ? 0 : (existingConv.unreadCount ?? 0) + 1,
          windowExpiresAt,
          updatedAt: now,
        })
        .where(eq(conversations.id, conversationId));
    } else {
      conversationId = createId();
      await db.insert(conversations).values({
        id: conversationId,
        tenantId: tenant.id,
        contactId,
        lastMessageAt: now,
        lastMessagePreview: preview,
        unreadCount: fromMe ? 0 : 1,
        windowExpiresAt,
      });
    }

    const direction = fromMe ? "outbound" : "inbound";
    const type = messageType === "conversation" ? "text" : messageType;

    if (waMessageId) {
      const [existing] = await db
        .select({ id: messages.id })
        .from(messages)
        .where(eq(messages.waMessageId, waMessageId))
        .limit(1);
      if (existing) return NextResponse.json({ received: true });
    }

    await db.insert(messages).values({
      tenantId: tenant.id,
      conversationId,
      waMessageId,
      direction,
      type,
      content: content || null,
      status: "delivered",
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Webhook Evolution]", err);
    return NextResponse.json({ received: true });
  }
}
