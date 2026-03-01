import Link from "next/link";
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

const kpis = [
  {
    title: "Conversas Ativas",
    value: "24",
    delta: "+12%",
    deltaType: "positive" as const,
    icon: MessageSquare,
  },
  {
    title: "Tempo Médio Resposta",
    value: "3min",
    delta: "-15%",
    deltaType: "positive" as const,
    icon: Clock,
  },
  {
    title: "Taxa de Conversão",
    value: "32%",
    delta: "+5%",
    deltaType: "positive" as const,
    icon: TrendingUp,
  },
  {
    title: "Novos Leads",
    value: "48",
    delta: "+22%",
    deltaType: "positive" as const,
    icon: UserPlus,
  },
];

const recentConversations = [
  { id: "conv1", name: "Maria Silva", initials: "MS", message: "Oi, vocês têm o vestido floral em M?", time: "3min", unread: 2, status: "open" as const },
  { id: "conv2", name: "João Santos", initials: "JS", message: "Qual o prazo de entrega pro RJ?", time: "15min", unread: 1, status: "open" as const },
  { id: "conv3", name: "Ana Oliveira", initials: "AO", message: "Pix enviado! Segue comprovante", time: "45min", unread: 0, status: "waiting" as const },
  { id: "conv4", name: "Pedro Costa", initials: "PC", message: "Bom dia, vi o anúncio no Instagram", time: "2h", unread: 1, status: "open" as const },
  { id: "conv5", name: "Camila Ferreira", initials: "CF", message: "Tem desconto pra compra acima de 3?", time: "4h", unread: 0, status: "open" as const },
];

const recentActivity = [
  { icon: ShoppingCart, text: "Maria Silva adicionou Vestido Floral ao carrinho", time: "há 5 min", color: "text-blue-500" },
  { icon: Bot, text: "Copiloto IA sugeriu resposta para João Santos", time: "há 12 min", color: "text-purple-500" },
  { icon: CreditCard, text: "Ana Oliveira confirmou pagamento Pix de R$ 349,90", time: "há 45 min", color: "text-emerald-500" },
  { icon: UserCheck, text: "Novo lead: Pedro Costa via Instagram Ads", time: "há 2h", color: "text-orange-500" },
  { icon: Bot, text: "Copiloto IA classificou intenção: Compra (92%)", time: "há 2h", color: "text-purple-500" },
  { icon: CreditCard, text: "Lucas Mendes recebeu pedido #1247", time: "há 8h", color: "text-emerald-500" },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Painel</h1>
        <p className="text-muted-foreground text-sm">
          Visão geral do seu negócio no WhatsApp
        </p>
      </div>

      {/* KPI Cards */}
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
                <div className="flex items-center gap-1 mt-1">
                  {isPositive ? (
                    <ArrowUpRight className="size-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="size-3 text-red-500" />
                  )}
                  <Badge
                    variant="secondary"
                    className={
                      isPositive ? "text-emerald-600" : "text-red-600"
                    }
                  >
                    {kpi.delta}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    vs. mês anterior
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Conversations - 3 cols */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Conversas Recentes</CardTitle>
              <CardDescription>
                Últimas interações com seus clientes
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/inbox">
                Ver todas <ChevronRight className="size-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentConversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/inbox/${conv.id}`}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-accent transition-colors"
              >
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className="text-xs">{conv.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{conv.name}</span>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.message}</p>
                </div>
                {conv.unread > 0 && (
                  <Badge className="shrink-0 text-xs rounded-full size-5 flex items-center justify-center p-0">
                    {conv.unread}
                  </Badge>
                )}
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Activity Feed - 2 cols */}
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
