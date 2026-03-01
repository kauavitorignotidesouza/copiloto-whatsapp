"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Copy, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SuggestionCardProps {
  index: number;
  text: string;
  tone: "friendly" | "neutral" | "formal";
  confidence: number;
}

const toneLabels = { friendly: "Amigável", neutral: "Neutro", formal: "Formal" };

export function SuggestionCard({ index, text, tone, confidence }: SuggestionCardProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleUse = () => {
    navigator.clipboard.writeText(text);
    toast.success("Resposta copiada para a área de transferência");
  };

  return (
    <div className="border rounded-lg p-3 space-y-2 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground">
          Sugestão {index}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">
            {toneLabels[tone]}
          </span>
          <span className="text-[10px] font-medium text-primary">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      </div>

      <p className="text-xs leading-relaxed">{text}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={handleUse}>
            <Copy className="h-3 w-3 mr-1" />
            Usar
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
            <Pencil className="h-3 w-3 mr-1" />
            Editar
          </Button>
        </div>
        <div className="flex gap-0.5">
          <button
            onClick={() => setFeedback("up")}
            className={cn(
              "p-1 rounded hover:bg-muted transition-colors",
              feedback === "up" && "text-green-600 bg-green-50"
            )}
          >
            <ThumbsUp className="h-3 w-3" />
          </button>
          <button
            onClick={() => setFeedback("down")}
            className={cn(
              "p-1 rounded hover:bg-muted transition-colors",
              feedback === "down" && "text-red-600 bg-red-50"
            )}
          >
            <ThumbsDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
