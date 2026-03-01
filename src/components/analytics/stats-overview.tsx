"use client";

import { MessageSquare, Clock, Target, UserPlus, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const stats = [
  {
    title: "Conversas Ativas",
    value: "24",
    delta: "+12%",
    positive: true,
    icon: MessageSquare,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    title: "Tempo Médio Resposta",
    value: "3min",
    delta: "-15%",
    positive: true,
    icon: Clock,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    title: "Taxa de Conversão",
    value: "32%",
    delta: "+5%",
    positive: true,
    icon: Target,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
  },
  {
    title: "Novos Leads",
    value: "48",
    delta: "+22%",
    positive: true,
    icon: UserPlus,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
  },
];

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.title}</span>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.iconBg)}>
                <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className={cn(
                "text-xs font-medium flex items-center gap-0.5 mb-1",
                stat.positive ? "text-green-600" : "text-red-600"
              )}>
                {stat.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.delta}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
