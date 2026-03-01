"use client";

import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const funnelData = [
  { stage: "Novo Lead", count: 48, value: 24500, pct: 100, color: "bg-blue-500" },
  { stage: "Qualificação", count: 31, value: 17200, pct: 65, color: "bg-yellow-500" },
  { stage: "Proposta", count: 19, value: 11800, pct: 40, color: "bg-purple-500" },
  { stage: "Pagamento", count: 12, value: 7500, pct: 25, color: "bg-orange-500" },
  { stage: "Pós-venda", count: 10, value: 5900, pct: 20, color: "bg-green-500" },
];

export function FunnelChart() {
  return (
    <div className="space-y-3">
      {funnelData.map((item, index) => (
        <div key={item.stage}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
              <span className="text-sm font-medium">{item.stage}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{item.count} leads</span>
              <span className="text-sm font-medium w-28 text-right">{formatCurrency(item.value)}</span>
              <span className="text-xs text-muted-foreground w-10 text-right">{item.pct}%</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={cn("h-3 rounded-full transition-all duration-500", item.color)}
              style={{ width: `${item.pct}%` }}
            />
          </div>
          {index < funnelData.length - 1 && (
            <div className="text-right text-[10px] text-muted-foreground mt-0.5">
              {Math.round((funnelData[index + 1].count / item.count) * 100)}% conversão →
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
