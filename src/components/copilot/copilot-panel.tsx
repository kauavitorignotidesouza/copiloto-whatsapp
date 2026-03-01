"use client";

import { Sparkles, BrainCircuit, ArrowRight, Package } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SuggestionCard } from "./suggestion-card";
import { useInboxStore } from "@/lib/stores/inbox-store";
import { mockAiSuggestions } from "@/lib/mock-data";

interface CopilotPanelProps {
  conversationId: string;
}

export function CopilotPanel({ conversationId }: CopilotPanelProps) {
  const { copilotEnabled, toggleCopilot } = useInboxStore();

  return (
    <div className="p-4 space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Copiloto IA</span>
        </div>
        <Switch checked={copilotEnabled} onCheckedChange={toggleCopilot} />
      </div>

      {!copilotEnabled && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Ative o copiloto para receber sugestões de resposta.
        </p>
      )}

      {copilotEnabled && (
        <>
          {/* Intent Detection */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <BrainCircuit className="h-3 w-3" />
              Intenção detectada
            </h4>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                Compra
              </Badge>
              <span className="text-xs text-muted-foreground">92% confiança</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "92%" }} />
            </div>
          </div>

          <Separator />

          {/* Suggestions */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">
              Sugestões de resposta
            </h4>
            <div className="space-y-2">
              {mockAiSuggestions.map((suggestion, i) => (
                <SuggestionCard
                  key={suggestion.id}
                  index={i + 1}
                  text={suggestion.text}
                  tone={suggestion.tone}
                  confidence={suggestion.confidence}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Next Action */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">
              Próxima ação recomendada
            </h4>
            <div className="border border-dashed rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <Package className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium">Enviar catálogo</p>
                  <p className="text-[10px] text-muted-foreground">Mostrar vestidos florais disponíveis</p>
                </div>
              </div>
              <button className="w-full text-xs bg-primary/5 hover:bg-primary/10 text-primary py-1.5 rounded-md transition-colors flex items-center justify-center gap-1">
                Executar <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="border border-dashed rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-purple-100 flex items-center justify-center">
                  <ArrowRight className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium">Mover para Proposta</p>
                  <p className="text-[10px] text-muted-foreground">Cliente demonstrou interesse</p>
                </div>
              </div>
              <button className="w-full text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1">
                Executar <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* RAG Source */}
          <div className="text-[10px] text-muted-foreground">
            <span className="font-medium">Baseado em:</span> Catálogo de produtos, Política de preços
          </div>
        </>
      )}
    </div>
  );
}
