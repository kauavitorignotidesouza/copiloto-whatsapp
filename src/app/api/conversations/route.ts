import { NextRequest, NextResponse } from "next/server";
import { mockConversations } from "@/lib/mock-data";

// GET: List conversations
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let conversations = [...mockConversations];

  if (status && status !== "all") {
    conversations = conversations.filter((c) => c.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    conversations = conversations.filter(
      (c) =>
        c.contactName.toLowerCase().includes(q) ||
        c.contactPhone.includes(q)
    );
  }

  // Sort by last message time (newest first)
  conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

  return NextResponse.json({ conversations });
}
