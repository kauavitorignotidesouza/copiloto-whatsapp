import { NextRequest, NextResponse } from "next/server";

// GET: WhatsApp webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "change-me";

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge || "", { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST: Receive webhook events from WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Validate X-Hub-Signature-256 in production
    // For now, just acknowledge and log

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === "messages") {
          const value = change.value;
          const messages = value.messages || [];
          const statuses = value.statuses || [];

          // Process incoming messages
          for (const msg of messages) {
            console.log("[Webhook] Incoming message:", {
              from: msg.from,
              type: msg.type,
              text: msg.text?.body,
            });
            // TODO: Store in database, trigger AI classification
          }

          // Process status updates
          for (const status of statuses) {
            console.log("[Webhook] Status update:", {
              id: status.id,
              status: status.status,
            });
            // TODO: Update message status in database
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Webhook] Error processing:", error);
    return NextResponse.json({ status: "ok" }); // Always return 200 to Meta
  }
}
