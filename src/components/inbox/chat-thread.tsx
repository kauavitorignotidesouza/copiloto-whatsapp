"use client";

import { useRef, useEffect, useState } from "react";
import { Phone, MoreVertical, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { WindowTimer } from "./window-timer";
import { mockConversations, mockMessages, mockContacts, type MockMessage } from "@/lib/mock-data";

interface ChatThreadProps {
  conversationId: string;
}

export function ChatThread({ conversationId }: ChatThreadProps) {
  const conversation = mockConversations.find((c) => c.id === conversationId);
  const contact = mockContacts.find((c) => c.id === conversation?.contactId);
  const [messages, setMessages] = useState<MockMessage[]>(mockMessages[conversationId] || []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Conversa não encontrada.
      </div>
    );
  }

  const windowExpired = new Date(conversation.windowExpiresAt) < new Date();

  const handleSend = (content: string) => {
    const newMsg: MockMessage = {
      id: `m-${Date.now()}`,
      conversationId,
      direction: "outbound",
      type: "text",
      content,
      status: "sent",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    // Simulate delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: "delivered" } : m))
      );
    }, 1000);
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: "read" } : m))
      );
    }, 3000);
  };

  const statusLabels: Record<string, string> = {
    open: "Aberta",
    waiting: "Aguardando",
    closed: "Fechada",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
            {conversation.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{conversation.contactName}</h3>
              <Badge variant={conversation.status === "open" ? "default" : "secondary"} className="text-[10px] h-5">
                {statusLabels[conversation.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {conversation.contactPhone}
              </span>
              <WindowTimer windowExpiresAt={conversation.windowExpiresAt} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-xs h-8">
            <X className="h-3.5 w-3.5 mr-1" />
            Fechar
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-1">
          {messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-10">
              Nenhuma mensagem nesta conversa.
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <MessageInput onSend={handleSend} windowExpired={windowExpired} />
    </div>
  );
}
