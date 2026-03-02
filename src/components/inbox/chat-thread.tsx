"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  MoreVertical,
  X,
  Archive,
  CheckCircle,
  RotateCcw,
  Trash2,
  MessageSquareText,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

const QUICK_REPLY_TEMPLATES = [
  "Ola! Como posso ajuda-lo hoje?",
  "Obrigado pelo contato! Estamos verificando e retornaremos em breve.",
  "Seu pedido foi atualizado! Precisa de mais alguma informacao?",
];

export function ChatThread({ conversationId }: ChatThreadProps) {
  const router = useRouter();
  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [messages, setMessages] = useState<MessageForBubble[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
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
      toast.error("Erro ao enviar mensagem.");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erro ao atualizar conversa.");
        return;
      }

      setConversation((prev) => (prev ? { ...prev, status } : prev));

      const labels: Record<string, string> = {
        closed: "Conversa marcada como resolvida.",
        open: "Conversa reaberta.",
        archived: "Conversa arquivada.",
      };
      toast.success(labels[status] ?? "Status atualizado.");

      if (status === "closed" || status === "archived") {
        router.push("/inbox");
      }
    } catch {
      toast.error("Erro ao atualizar conversa.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir esta conversa? Esta acao nao pode ser desfeita.")) {
      return;
    }

    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erro ao excluir conversa.");
        return;
      }

      toast.success("Conversa excluida.");
      router.push("/inbox");
    } catch {
      toast.error("Erro ao excluir conversa.");
    }
  };

  const handleTemplateSend = (text: string) => {
    setShowTemplates(false);
    handleSend(text);
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
        Conversa nao encontrada.
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
    archived: "Arquivada",
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
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8"
            onClick={() => handleUpdateStatus("closed")}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Fechar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleUpdateStatus("closed")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como resolvida
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus("open")}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reabrir conversa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus("archived")}>
                <Archive className="h-4 w-4 mr-2" />
                Arquivar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir conversa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      <MessageInput
        onSend={handleSend}
        windowExpired={windowExpired}
        onTemplateClick={() => setShowTemplates(true)}
      />

      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respostas rapidas</DialogTitle>
            <DialogDescription>
              Selecione um modelo para enviar como mensagem.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            {QUICK_REPLY_TEMPLATES.map((template, index) => (
              <button
                key={index}
                type="button"
                className="flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent"
                onClick={() => handleTemplateSend(template)}
              >
                <MessageSquareText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span>{template}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
