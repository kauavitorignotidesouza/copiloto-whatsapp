"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { mockDeals, type MockDeal } from "@/lib/mock-data";
import { FUNNEL_STAGES } from "@/lib/utils/constants";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function DealCard({ deal }: { deal: MockDeal }) {
  const stage = FUNNEL_STAGES.find((s) => s.value === deal.funnelStage);

  return (
    <div className={cn(
      "bg-card border rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow",
      "border-l-4",
      stage?.value === "novo_lead" && "border-l-blue-500",
      stage?.value === "qualificacao" && "border-l-yellow-500",
      stage?.value === "proposta" && "border-l-purple-500",
      stage?.value === "pagamento" && "border-l-orange-500",
      stage?.value === "pos_venda" && "border-l-green-500",
    )}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium shrink-0">
          {deal.avatarInitials}
        </div>
        <span className="text-sm font-medium truncate">{deal.contactName}</span>
      </div>
      <p className="text-xs text-muted-foreground truncate mb-2">{deal.product}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{formatCurrency(deal.value)}</span>
        <span className="text-[10px] text-muted-foreground">{deal.daysInStage}d nesta etapa</span>
      </div>
    </div>
  );
}

export function PipelineBoard() {
  const [deals] = useState<MockDeal[]>(mockDeals);

  return (
    <div className="flex gap-4 h-[calc(100vh-10rem)] overflow-x-auto pb-4">
      {FUNNEL_STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.funnelStage === stage.value);
        const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

        return (
          <div key={stage.value} className="w-72 shrink-0 flex flex-col">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", stage.color)} />
                <h3 className="text-sm font-semibold">{stage.label}</h3>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {stageDeals.length}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {formatCurrency(totalValue)}
            </p>

            {/* Cards */}
            <ScrollArea className="flex-1 rounded-lg bg-muted/30 p-2">
              {stageDeals.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Nenhum deal
                </div>
              ) : (
                stageDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
              )}
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
