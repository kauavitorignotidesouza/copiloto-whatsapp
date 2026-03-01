import { StatsOverview } from "@/components/analytics/stats-overview";
import { FunnelChart } from "@/components/analytics/funnel-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Relatórios e Métricas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe o desempenho do seu atendimento e vendas.
        </p>
      </div>

      <StatsOverview />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <FunnelChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Desempenho por Atendente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Você", conversations: 45, avgTime: "2min", satisfaction: 95 },
              { name: "Carlos Silva", conversations: 38, avgTime: "4min", satisfaction: 88 },
              { name: "Ana Paula", conversations: 32, avgTime: "3min", satisfaction: 92 },
            ].map((agent) => (
              <div key={agent.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    {agent.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="text-sm font-medium">{agent.name}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{agent.conversations} conversas</span>
                  <span>~{agent.avgTime}</span>
                  <span className="text-green-600 font-medium">{agent.satisfaction}% CSAT</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
