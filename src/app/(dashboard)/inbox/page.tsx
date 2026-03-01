import { Inbox } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <Inbox className="size-16 text-muted-foreground/50 mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Caixa de Entrada</h1>
      <p className="text-muted-foreground">
        Selecione uma conversa para começar
      </p>
    </div>
  );
}
