import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MessageSquare,
  Clock,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Bot,
  ShoppingCart,
  CreditCard,
  UserCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { conversations, contacts } from "@/lib/db/schema";
import { eq, desc, and, count } from "drizzle-orm";

function getInitials(name: string | null): string {
  if (!name || !name.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(date: Date | null): string {
  if (!date) return "—";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  if (hrs < 24) return `${hrs}h`;
  return `${days}d`;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenantId = (session.user as unknown as { tenantId?: string }).tenantId;
  if (!tenantId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Sessão inválida. Faça login novamente.</p>
      </div>
    );
  }

  const tenantFilter = eq(conversations.tenantId, tenantId);

  const [conversationsCount] = await db
    .select({ count: count() })
    .from(conversations)
    .where(and(tenantFilter, eq(conversations.status, "open")));

  const [contactsCount] = await db
    .select({ count: count() })
    .from(contacts)
    .where(eq(contacts.tenantId, tenantId));

  const recentConversationsRows = await db
    .select({
      id: conversations.id,
      lastMessagePreview: conversations.lastMessagePreview,
      lastMessageAt: conversations.lastMessageAt,
      unreadCount: conversations.unreadCount,
      status: conversations.status,
      contactName: contacts.name,
      contactProfileName: contacts.profileName,
    })
    .from(conversations)
    .innerJoin(contacts, eq(conversations.contactId, contacts.id))
    .where(tenantFilter)
    .orderBy(desc(conversations.lastMessageAt))
    .limit(5);

  const activeCount = conversationsCount?.count ?? 0;
  const leadsCount = contactsCount?.count ?? 0;

  const kpis = [
    { title: "Conversas Ativas", value: String(activeCount), delta: "—", deltaType: "positive" as const, icon: MessageSquare },
    { title: "Tempo Médio Resposta", value: "—", delta: "—", deltaType: "positive" as const, icon: Clock },
    { title: "Taxa de Conversão", value: "—", delta: "—", deltaType: "positive" as const, icon: TrendingUp },
    { title: "Contatos", value: String(leadsCount), delta: "—", deltaType: "positive" as const, icon: UserPlus },
  ];

  const recentActivity = [
    { icon: ShoppingCart, text: "Atividade recente aparecerá aqui", time: "—", color: "text-blue-500" },
    { icon: Bot, text: "Conecte o WhatsApp e a IA para ver sugestões", time: "—", color: "text-purple-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Painel</h1>
        <p className="text-muted-foreground text-sm">
          Visão geral do seu negócio no WhatsApp
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = kpi.deltaType === "positive";
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                {kpi.delta !== "—" && (
                  <div className="flex items-center gap-1 mt-1">
                    {isPositive ? (
                      <ArrowUpRight className="size-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="size-3 text-red-500" />
                    )}
                    <Badge variant="secondary" className={isPositive ? "text-emerald-600" : "text-red-600"}>
                      {kpi.delta}
                    </Badge>
                    <span className="text-xs text-muted-foreground">vs. mês anterior</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Conversas Recentes</CardTitle>
              <CardDescription>Últimas interações com seus clientes</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/inbox">Ver todas <ChevronRight className="size-4 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentConversationsRows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Nenhuma conversa ainda. Conecte o WhatsApp para começar.</p>
            ) : (
              recentConversationsRows.map((row) => {
                const name = row.contactName || row.contactProfileName || "Contato";
                const initials = getInitials(name);
                return (
                  <Link
                    key={row.id}
                    href={`/inbox/${row.id}`}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-accent transition-colors"
                  >
                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{name}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(row.lastMessageAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{row.lastMessagePreview || "—"}</p>
                    </div>
                    {(row.unreadCount ?? 0) > 0 && (
                      <Badge className="shrink-0 text-xs rounded-full size-5 flex items-center justify-center p-0">
                        {row.unreadCount}
                      </Badge>
                    )}
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Eventos e ações do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <div key={i}>
                  <div className="flex gap-3">
                    <div className={`shrink-0 mt-0.5 ${activity.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                  {i < recentActivity.length - 1 && <Separator className="mt-3" />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
