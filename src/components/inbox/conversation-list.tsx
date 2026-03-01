"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useInboxStore } from "@/lib/stores/inbox-store";
import { useRouter } from "next/navigation";

const filters = [
  { value: "all", label: "Todas" },
  { value: "open", label: "Abertas" },
  { value: "waiting", label: "Aguardando" },
  { value: "closed", label: "Fechadas" },
] as const;

function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  if (hrs < 24) return `${hrs}h`;
  return `${days}d`;
}

type ConversationItem = {
  id: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageAt: Date | string | null;
  unreadCount: number;
  status: string;
  avatarInitials: string;
};

export function ConversationList() {
  const router = useRouter();
  const { selectedConversationId, selectConversation, searchQuery, setSearchQuery } = useInboxStore();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeFilter !== "all") params.set("status", activeFilter);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());

    fetch(`/api/conversations?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { conversations: [] }))
      .then((data) => {
        setConversations(data.conversations ?? []);
      })
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, [activeFilter, searchQuery]);

  const filtered = conversations.filter((c) => {
    if (searchQuery.trim() && !c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) && !c.contactPhone.includes(searchQuery)) return false;
    return true;
  });

  return (
    <>
      <div className="p-3 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-full transition-colors",
                activeFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  selectConversation(conv.id);
                  router.push(`/inbox/${conv.id}`);
                }}
                className={cn(
                  "w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors",
                  selectedConversationId === conv.id && "bg-muted"
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                    {conv.avatarInitials}
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                      conv.status === "open" && "bg-green-500",
                      conv.status === "waiting" && "bg-yellow-500",
                      conv.status === "closed" && "bg-gray-400"
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm truncate", conv.unreadCount > 0 ? "font-semibold" : "font-medium")}>
                      {conv.contactName}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {formatRelativeTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate pr-2">
                      {conv.lastMessage || "—"}
                    </p>
                    {conv.unreadCount > 0 && (
                      <Badge variant="default" className="shrink-0 h-5 min-w-5 flex items-center justify-center text-[10px] px-1.5">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
          {!loading && filtered.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma conversa encontrada.
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
}
