"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WindowTimerProps {
  windowExpiresAt: Date;
}

export function WindowTimer({ windowExpiresAt }: WindowTimerProps) {
  const [remaining, setRemaining] = useState<{ hours: number; minutes: number } | null>(null);

  useEffect(() => {
    function calc() {
      const diff = new Date(windowExpiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining(null);
        return;
      }
      setRemaining({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      });
    }
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [windowExpiresAt]);

  if (!remaining) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>Janela expirada</span>
      </div>
    );
  }

  const totalHours = remaining.hours + remaining.minutes / 60;
  const color = totalHours > 4 ? "text-green-600" : totalHours > 1 ? "text-yellow-600" : "text-red-600";

  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-medium", color)}>
      <Clock className="h-3.5 w-3.5" />
      <span>Janela: {remaining.hours}h {remaining.minutes}min</span>
    </div>
  );
}
