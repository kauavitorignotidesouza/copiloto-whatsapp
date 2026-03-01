"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  Tag,
  MessageSquare,
  Calendar,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { mockContacts, mockConversations, mockDeals } from "@/lib/mock-data";
import { FUNNEL_STAGES } from "@/lib/utils/constants";
import { formatPhone } from "@/lib/utils/format";

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = use(params);
  const contact = mockContacts.find((c) => c.id === contactId);

  if (!contact) {
    return (
      <div className="p-6">
        <Link href="/crm/contacts" className="text-primary hover:underline text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="size-4" /> Voltar para contatos
        </Link>
        <p className="text-muted-foreground">Contato não encontrado.</p>
      </div>
    );
  }

  const conversations = mockConversations.filter((c) => c.contactId === contactId);
  const deals = mockDeals.filter((d) => d.contactName === contact.name);
  const stage = FUNNEL_STAGES.find((s) => s.value === contact.funnelStage);

  return (
    <div className="p-6 space-y-6">
      <Link href="/crm" className="text-primary hover:underline text-sm flex items-center gap-1">
        <ArrowLeft className="size-4" /> Voltar para CRM
      </Link>

      {/* Contact header */}
      <div className="flex items-start gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="text-xl">{contact.avatarInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{contact.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Phone className="size-3.5" /> {formatPhone(contact.waId)}
            </span>
            {contact.email && (
              <span className="flex items-center gap-1">
                <Mail className="size-3.5" /> {contact.email}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {stage && (
              <Badge variant="outline">
                <span className={`size-2 rounded-full ${stage.color} mr-1.5`} />
                {stage.label}
              </Badge>
            )}
            {contact.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
        <Button asChild>
          <Link href={conversations[0] ? `/inbox/${conversations[0].id}` : "/inbox"}>
            <MessageSquare className="size-4 mr-2" /> Abrir conversa
          </Link>
        </Button>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="size-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Empresa:</span>
                <span className="font-medium">{contact.company}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Phone className="size-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">WhatsApp:</span>
              <span className="font-medium">{formatPhone(contact.waId)}</span>
            </div>
            {contact.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{contact.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Tag className="size-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Tags:</span>
              <span className="font-medium">{contact.tags.length > 0 ? contact.tags.join(", ") : "Nenhuma"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Cadastro:</span>
              <span className="font-medium">há 12 dias</span>
            </div>
          </CardContent>
        </Card>

        {/* Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversas ({conversations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/inbox/${conv.id}`}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors"
                  >
                    <MessageSquare className="size-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{conv.lastMessage}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv.status === "open" ? "Aberta" : conv.status === "waiting" ? "Aguardando" : "Fechada"}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Negociações ({deals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {deals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma negociação encontrada.</p>
            ) : (
              <div className="space-y-2">
                {deals.map((deal) => {
                  const dealStage = FUNNEL_STAGES.find((s) => s.value === deal.funnelStage);
                  return (
                    <div key={deal.id} className="flex items-center gap-3 rounded-md p-2 border">
                      <ShoppingBag className="size-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{deal.product}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {deal.value.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      {dealStage && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          <span className={`size-2 rounded-full ${dealStage.color} mr-1`} />
                          {dealStage.label}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
