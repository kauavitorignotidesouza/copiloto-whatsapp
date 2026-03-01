import { TemplateList } from "@/components/templates/template-list";

export default function TemplatesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Modelos WhatsApp</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Crie e gerencie modelos de mensagens aprovados pelo WhatsApp.
        </p>
      </div>
      <TemplateList />
    </div>
  );
}
