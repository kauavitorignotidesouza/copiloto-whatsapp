import { NextRequest, NextResponse } from "next/server";
import { mockMessages } from "@/lib/mock-data";

// GET: List messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const messages = mockMessages[id] || [];

  return NextResponse.json({ messages });
}

// POST: Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const newMessage = {
    id: `m-${Date.now()}`,
    conversationId: id,
    direction: "outbound" as const,
    type: body.type || "text",
    content: body.content,
    status: "sent" as const,
    createdAt: new Date(),
    isAiGenerated: body.isAiGenerated || false,
  };

  // In production: save to DB, send via WhatsApp Cloud API, emit Socket.io event
  console.log("[API] Message sent:", newMessage);

  return NextResponse.json({ message: newMessage }, { status: 201 });
}
