import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { tenants, contacts, conversations, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { calculateWindowExpiry } from "@/lib/whatsapp/24h-window";

const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "change-me";
const appSecret = process.env.META_APP_SECRET || process.env.APP_SECRET;

function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!appSecret || !signatureHeader?.startsWith("sha256=")) return true;
  const signature = signatureHeader.slice(7);
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  if (signature.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

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
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-hub-signature-256");
    if (!verifyMetaSignature(rawBody, signatureHeader)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const entries = Array.isArray(body.entry) ? body.entry : [];
    for (const entry of entries) {
      const changes = Array.isArray((entry as Record<string, unknown>).changes)
        ? ((entry as Record<string, unknown>).changes as unknown[])
        : [];
      for (const change of changes) {
        if ((change as Record<string, unknown>).field !== "messages") continue;

        const value = (change as Record<string, unknown>).value as Record<string, unknown>;
        const metadata = (value.metadata ?? {}) as Record<string, unknown>;
        const phoneNumberId = String(metadata.phone_number_id ?? "");

        if (!phoneNumberId) continue;

        const [tenant] = await db
          .select()
          .from(tenants)
          .where(eq(tenants.whatsappPhoneNumberId, phoneNumberId))
          .limit(1);

        if (!tenant) continue;

        const incomingMessages = Array.isArray(value.messages) ? value.messages : [];
        const contactsList = Array.isArray(value.contacts) ? value.contacts : [];
        const profileName = (contactsList[0] as Record<string, unknown>)?.profile as Record<string, unknown> | undefined;
        const profileNameStr = (profileName?.name ?? null) as string | null;

        for (const msg of incomingMessages) {
          const msgObj = msg as Record<string, unknown>;
          const fromWaId = String(msgObj.from ?? "");
          const waMessageId = msgObj.id as string | null ?? null;
          const type = (msgObj.type ?? "text") as string;
          const textObj = msgObj.text as Record<string, unknown> | undefined;
          const caption = msgObj.caption as string | undefined;
          const textBody = (textObj?.body ?? caption) as string;
          const content = type === "text" ? textBody : type === "image" || type === "video" || type === "document" ? `[${type}] ${textBody || "(sem legenda)"}`.trim() : `[${type}]`;

          const [contact] = await db
            .select()
            .from(contacts)
            .where(and(eq(contacts.tenantId, tenant.id), eq(contacts.waId, fromWaId)))
            .limit(1);

          let contactId: string;
          if (contact) {
            contactId = contact.id;
            if (profileNameStr && contact.profileName !== profileNameStr) {
              await db.update(contacts).set({ profileName: profileNameStr, updatedAt: new Date() }).where(eq(contacts.id, contactId));
            }
          } else {
            contactId = createId();
            await db.insert(contacts).values({
              id: contactId,
              tenantId: tenant.id,
              waId: fromWaId,
              profileName: profileNameStr ?? undefined,
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

        const statuses = Array.isArray(value.statuses) ? value.statuses : [];
        for (const status of statuses) {
          const s = status as Record<string, unknown>;
          const msgId = String(s.id ?? "");
          const statusValue = s.status;
          const [existingMsg] = await db.select().from(messages).where(eq(messages.waMessageId, msgId)).limit(1);
          if (existingMsg) {
            await db.update(messages).set({ status: String(statusValue) }).where(eq(messages.id, existingMsg.id));
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
