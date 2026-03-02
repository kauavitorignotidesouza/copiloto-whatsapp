"use client";

import { useState, useEffect } from "react";
import { Phone, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopilotPanel } from "@/components/copilot/copilot-panel";
import { FUNNEL_STAGES } from "@/lib/utils/constants";

interface ContextPanelProps {
  conversationId: string;
}

type ConversationItem = {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  status: string;
  avatarInitials: string;
};

export function ContextPanel({ conversationId }: ContextPanelProps) {
  const [conversation, setConversation] = useState<ConversationItem | null>(null);

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => (res.ok ? res.json() : { conversations: [] }))
      .then((data) => {
        const c = (data.conversations ?? []).find((x: { id: string }) => x.id === conversationId);
        if (c) setConversation(c);
      })
      .catch(() => {});
  }, [conversationId]);

  if (!conversation) return null;

  const stage = FUNNEL_STAGES.find((s) => s.value === "novo_lead");

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="copilot" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b h-10 bg-transparent px-2">
          <TabsTrigger value="contact" className="text-xs flex-1">Contato</TabsTrigger>
          <TabsTrigger value="copilot" className="text-xs flex-1">Copiloto IA</TabsTrigger>
          <TabsTrigger value="history" className="text-xs flex-1">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="flex-1 overflow-auto p-4 mt-0 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold mx-auto mb-2">
              {conversation.avatarInitials}
            </div>
            <h3 className="font-semibold">{conversation.contactName}</h3>
            {stage && (
              <Badge className="mt-1 text-xs" variant="secondary">
                {stage.label}
              </Badge>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{conversation.contactPhone || "—"}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="copilot" className="flex-1 overflow-auto mt-0">
          <CopilotPanel conversationId={conversationId} />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-auto p-4 mt-0">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Conversas anteriores aparecerão aqui
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
