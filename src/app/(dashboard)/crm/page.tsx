"use client";

import { useState } from "react";
import { Kanban, TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineBoard } from "@/components/crm/pipeline-board";
import { ContactTable } from "@/components/crm/contact-table";

export default function CRMPage() {
  const [view, setView] = useState<"pipeline" | "table">("pipeline");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Funil de Vendas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie seus leads e acompanhe o progresso de cada negociação.
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          <Button
            variant={view === "pipeline" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("pipeline")}
            className="h-8"
          >
            <Kanban className="h-4 w-4 mr-1.5" />
            Funil
          </Button>
          <Button
            variant={view === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("table")}
            className="h-8"
          >
            <TableIcon className="h-4 w-4 mr-1.5" />
            Contatos
          </Button>
        </div>
      </div>

      {view === "pipeline" ? <PipelineBoard /> : <ContactTable />}
    </div>
  );
}
