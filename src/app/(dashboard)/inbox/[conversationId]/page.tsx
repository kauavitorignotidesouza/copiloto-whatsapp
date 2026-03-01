import { ChatThread } from "@/components/inbox/chat-thread";
import { ContextPanel } from "@/components/inbox/context-panel";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <ChatThread conversationId={conversationId} />
      </div>
      <div className="w-80 border-l bg-card shrink-0">
        <ContextPanel conversationId={conversationId} />
      </div>
    </div>
  );
}
