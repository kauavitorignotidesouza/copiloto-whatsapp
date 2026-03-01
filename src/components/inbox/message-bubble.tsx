import { Check, CheckCheck, Clock, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <Clock className="h-3 w-3 text-muted-foreground" />;
    case "sent":
      return <Check className="h-3 w-3 text-muted-foreground" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    case "failed":
      return <AlertCircle className="h-3 w-3 text-destructive" />;
    default:
      return null;
  }
}

export function MessageBubble({ message }: { message: { id: string; direction: string; type: string; content: string; status: string; createdAt: Date; isAiGenerated?: boolean } }) {
  const isOutbound = message.direction === "outbound";

  return (
    <div className={cn("flex mb-2", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] px-3 py-2 text-sm relative",
          isOutbound
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
            : "bg-card border rounded-2xl rounded-bl-md"
        )}
      >
        {message.isAiGenerated && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] mb-1 font-medium",
            isOutbound ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            <Sparkles className="h-3 w-3" />
            <span>IA</span>
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className={cn(
          "flex items-center gap-1 mt-1",
          isOutbound ? "justify-end" : "justify-start"
        )}>
          <span className={cn(
            "text-[10px]",
            isOutbound ? "text-primary-foreground/60" : "text-muted-foreground"
          )}>
            {formatTime(message.createdAt)}
          </span>
          {isOutbound && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}
