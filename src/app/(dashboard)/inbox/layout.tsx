import { ConversationList } from "@/components/inbox/conversation-list";

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="w-80 border-r bg-card shrink-0 flex flex-col">
        <ConversationList />
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
