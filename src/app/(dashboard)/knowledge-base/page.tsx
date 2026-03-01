import { KBManager } from "@/components/knowledge-base/kb-manager";

export default function KnowledgeBasePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Base de Conhecimento</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Adicione documentos e informações para a IA utilizar nas respostas.
        </p>
      </div>
      <KBManager />
    </div>
  );
}
