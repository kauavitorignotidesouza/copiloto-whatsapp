"use client";

import { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, ArrowRight, Package, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SuggestionCard } from "./suggestion-card";
import { useInboxStore } from "@/lib/stores/inbox-store";

interface CopilotPanelProps {
  conversationId: string;
}

type Suggestion = { id: string; text: string; tone: "friendly" | "neutral" | "formal"; confidence: number };

const INTENT_LABELS: Record<string, string> = {
  compra: "Compra",
  suporte: "Suporte",
  preço: "Preço",
  reclamação: "Reclamação",
  geral: "Geral",
  agendamento: "Agendamento",
  pagamento: "Pagamento",
  "opt-out": "Opt-out",
};

export function CopilotPanel({ conversationId }: CopilotPanelProps) {
  const { copilotEnabled, toggleCopilot } = useInboxStore();
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!copilotEnabled || !conversationId) {
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });
    fetch("/api/copilot/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => { throw new Error(e.error || "Erro ao carregar"); });
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setIntent(data.intent ?? "geral");
        setConfidence(typeof data.confidence === "number" ? data.confidence : 0.5);
        setSuggestions(data.suggestions ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Erro ao gerar sugestões");
        setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [copilotEnabled, conversationId]);

  return (
    <div className="p-4 space-y-4">
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
          {error && (
            <p className="text-xs text-destructive text-center py-2">{error}</p>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Gerando sugestões...</span>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <BrainCircuit className="h-3 w-3" />
                  Intenção detectada
                </h4>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                    {INTENT_LABELS[intent ?? ""] ?? intent ?? "—"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{Math.round((confidence ?? 0) * 100)}% confiança</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${(confidence ?? 0) * 100}%` }} />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Sugestões de resposta</h4>
                <div className="space-y-2">
                  {suggestions.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">Nenhuma sugestão no momento.</p>
                  ) : (
                    suggestions.map((s, i) => (
                      <SuggestionCard
                        key={s.id}
                        index={i + 1}
                        text={s.text}
                        tone={s.tone}
                        confidence={s.confidence}
                      />
                    ))
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Próxima ação recomendada</h4>
                <div className="border border-dashed rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                      <Package className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Enviar catálogo</p>
                      <p className="text-[10px] text-muted-foreground">Mostrar produtos disponíveis</p>
                    </div>
                  </div>
                  <button className="w-full text-xs bg-primary/5 hover:bg-primary/10 text-primary py-1.5 rounded-md transition-colors flex items-center justify-center gap-1">
                    Executar <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
