"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Phone, MoreVertical, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { WindowTimer } from "./window-timer";

type MessageForBubble = {
  id: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  type: string;
  content: string;
  status: string;
  createdAt: Date | string;
  isAiGenerated?: boolean;
};

type ConversationInfo = {
  id: string;
  contactName: string;
  contactPhone: string;
  status: string;
  avatarInitials: string;
  windowExpiresAt: Date | string | null;
};

interface ChatThreadProps {
  conversationId: string;
}

export function ChatThread({ conversationId }: ChatThreadProps) {
  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [messages, setMessages] = useState<MessageForBubble[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => (res.ok ? res.json() : { conversations: [] }))
      .then((data) => {
        const list = data.conversations ?? [];
        const c = list.find((x: { id: string }) => x.id === conversationId);
        if (c) {
          setConversation({
            id: c.id,
            contactName: c.contactName,
            contactPhone: c.contactPhone,
            status: c.status,
            avatarInitials: c.avatarInitials ?? "?",
            windowExpiresAt: c.windowExpiresAt ?? null,
          });
        }
      })
      .catch(() => {});
  }, [conversationId]);

  const fetchMessages = useCallback(() => {
    fetch(`/api/conversations/${conversationId}/messages`)
      .then((res) => (res.ok ? res.json() : { messages: [] }))
      .then((data) => {
        const list = (data.messages ?? []).map((m: { createdAt: string }) => ({
          ...m,
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        }));
        setMessages((prev) => {
          // Só atualiza se mudou o número de mensagens (evita re-render desnecessário)
          if (prev.length !== list.length) return list;
          return prev;
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();
    // Polling a cada 3s para novas mensagens (simula real-time)
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type: "text" }),
      });
      const data = await res.json();
      if (data.message) {
        const m = {
          ...data.message,
          createdAt: data.message.createdAt ? new Date(data.message.createdAt) : new Date(),
        };
        setMessages((prev) => [...prev, m]);
      }
    } catch {
      // mantém UI; poderia mostrar toast de erro
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Conversa não encontrada.
      </div>
    );
  }

  const windowExpired = conversation.windowExpiresAt
    ? new Date(conversation.windowExpiresAt) < new Date()
    : false;

  const statusLabels: Record<string, string> = {
    open: "Aberta",
    waiting: "Aguardando",
    closed: "Fechada",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
            {conversation.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{conversation.contactName}</h3>
              <Badge variant={conversation.status === "open" ? "default" : "secondary"} className="text-[10px] h-5">
                {statusLabels[conversation.status] ?? conversation.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {conversation.contactPhone}
              </span>
              {conversation.windowExpiresAt && (
                <WindowTimer windowExpiresAt={conversation.windowExpiresAt instanceof Date ? conversation.windowExpiresAt : new Date(conversation.windowExpiresAt)} />
              )}
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

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-1">
          {messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-10">
              Nenhuma mensagem nesta conversa.
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={{
                  ...msg,
                  createdAt: msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
                }}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <MessageInput onSend={handleSend} windowExpired={windowExpired} />
    </div>
  );
}
