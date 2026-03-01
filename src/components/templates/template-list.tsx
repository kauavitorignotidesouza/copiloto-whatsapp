"use client";

import { useState } from "react";
import { Search, Plus, Edit, Copy, Trash2, MessageSquareText, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TemplateCategory = "marketing" | "utility" | "authentication";
type TemplateStatus = "approved" | "pending" | "rejected";

interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  status: TemplateStatus;
  header?: string;
  body: string;
  footer?: string;
}

const initialTemplates: Template[] = [
  {
    id: "t1",
    name: "Boas-vindas",
    category: "marketing",
    status: "approved",
    body: "Ol\u00e1 {{1}}! \ud83d\udc4b Bem-vindo(a) \u00e0 nossa loja! Confira nossas novidades em {{2}}. Qualquer d\u00favida, estamos aqui!",
  },
  {
    id: "t2",
    name: "Confirma\u00e7\u00e3o de Pedido",
    category: "utility",
    status: "approved",
    body: "Oi {{1}}, seu pedido #{{2}} foi confirmado! \u2705 Valor: R$ {{3}}. Previs\u00e3o de entrega: {{4}}.",
  },
  {
    id: "t3",
    name: "Lembrete de Pagamento",
    category: "utility",
    status: "pending",
    body: "Ol\u00e1 {{1}}, identificamos que o pagamento de R$ {{2}} est\u00e1 pendente. Chave Pix: {{3}}. Qualquer d\u00favida, responda aqui!",
  },
  {
    id: "t4",
    name: "Promo\u00e7\u00e3o Semanal",
    category: "marketing",
    status: "approved",
    body: "\ud83d\udd25 {{1}}, temos uma oferta especial para voc\u00ea! {{2}} com {{3}}% de desconto. V\u00e1lido at\u00e9 {{4}}. Aproveite!",
  },
  {
    id: "t5",
    name: "C\u00f3digo de Verifica\u00e7\u00e3o",
    category: "authentication",
    status: "rejected",
    body: "Seu c\u00f3digo de verifica\u00e7\u00e3o \u00e9: {{1}}. V\u00e1lido por 5 minutos. N\u00e3o compartilhe com ningu\u00e9m.",
  },
];

const categoryLabels: Record<TemplateCategory, string> = {
  marketing: "Marketing",
  utility: "Utilit\u00e1rio",
  authentication: "Autentica\u00e7\u00e3o",
};

const categoryColors: Record<TemplateCategory, string> = {
  marketing: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  utility: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  authentication: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
};

const statusLabels: Record<TemplateStatus, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
};

const statusColors: Record<TemplateStatus, string> = {
  approved: "bg-green-500/15 text-green-700 dark:text-green-400",
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-400",
};

function highlightVariables(text: string) {
  const parts = text.split(/(\{\{\d+\}\})/g);
  return parts.map((part, index) => {
    if (/\{\{\d+\}\}/.test(part)) {
      return (
        <span
          key={index}
          className="inline-flex items-center rounded bg-primary/15 px-1 py-0.5 text-xs font-mono font-semibold text-primary"
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function getNextVariableNumber(body: string): number {
  const matches = body.match(/\{\{(\d+)\}\}/g);
  if (!matches) return 1;
  const numbers = matches.map((m) => parseInt(m.replace(/\{\{|\}\}/g, ""), 10));
  return Math.max(...numbers) + 1;
}

const emptyForm = {
  name: "",
  category: "marketing" as TemplateCategory,
  header: "",
  body: "",
  footer: "",
};

export function TemplateList() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.body.toLowerCase().includes(search.toLowerCase()) ||
      categoryLabels[t.category].toLowerCase().includes(search.toLowerCase())
  );

  function openCreateDialog() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(template: Template) {
    setEditingId(template.id);
    setForm({
      name: template.name,
      category: template.category,
      header: template.header ?? "",
      body: template.body,
      footer: template.footer ?? "",
    });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.body.trim()) return;

    if (editingId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                name: form.name.trim(),
                category: form.category,
                header: form.header.trim() || undefined,
                body: form.body.trim(),
                footer: form.footer.trim() || undefined,
              }
            : t
        )
      );
    } else {
      const newTemplate: Template = {
        id: `t${Date.now()}`,
        name: form.name.trim(),
        category: form.category,
        status: "pending",
        header: form.header.trim() || undefined,
        body: form.body.trim(),
        footer: form.footer.trim() || undefined,
      };
      setTemplates((prev) => [...prev, newTemplate]);
    }

    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleDuplicate(template: Template) {
    const duplicate: Template = {
      ...template,
      id: `t${Date.now()}`,
      name: `${template.name} (c\u00f3pia)`,
      status: "pending",
    };
    setTemplates((prev) => [...prev, duplicate]);
  }

  function confirmDelete(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  function handleDelete() {
    if (deletingId) {
      setTemplates((prev) => prev.filter((t) => t.id !== deletingId));
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  }

  function insertVariable() {
    const nextVar = getNextVariableNumber(form.body);
    setForm((prev) => ({
      ...prev,
      body: `${prev.body}{{${nextVar}}}`,
    }));
  }

  return (
    <div className="space-y-4">
      {/* Search bar and create button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar modelos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-1.5" />
          Criar Modelo
        </Button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquareText className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-medium text-muted-foreground">
            Nenhum modelo encontrado
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {search
              ? "Tente buscar com outros termos."
              : "Crie seu primeiro modelo de mensagem."}
          </p>
        </div>
      )}

      {/* Template cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <Card
            key={template.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-medium leading-tight truncate">
                  {template.name}
                </CardTitle>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant="outline"
                    className={categoryColors[template.category]}
                  >
                    {categoryLabels[template.category]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={statusColors[template.status]}
                  >
                    {statusLabels[template.status]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Body preview */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs leading-relaxed line-clamp-4">
                  {highlightVariables(template.body)}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(template)}
                  className="flex-1"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicate(template)}
                  className="flex-1"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Duplicar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => confirmDelete(template.id)}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Modelo" : "Criar Modelo"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Altere os campos abaixo e salve as modifica\u00e7\u00f5es."
                : "Preencha os campos abaixo para criar um novo modelo de mensagem."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
            {/* Form fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Nome do modelo</Label>
                <Input
                  id="template-name"
                  placeholder="Ex: Boas-vindas"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-category">Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(value: TemplateCategory) =>
                    setForm((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="w-full" id="template-category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="utility">Utilit\u00e1rio</SelectItem>
                    <SelectItem value="authentication">
                      Autentica\u00e7\u00e3o
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-header">
                  Cabe\u00e7alho{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </Label>
                <Input
                  id="template-header"
                  placeholder="Texto do cabe\u00e7alho"
                  value={form.header}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, header: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="template-body">Corpo da mensagem</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={insertVariable}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {`{{${getNextVariableNumber(form.body)}}}`}
                  </Button>
                </div>
                <Textarea
                  id="template-body"
                  placeholder="Digite o corpo da mensagem. Use {{1}}, {{2}}, etc. para vari\u00e1veis."
                  rows={6}
                  value={form.body}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, body: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-footer">
                  Rodap\u00e9{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </Label>
                <Input
                  id="template-footer"
                  placeholder="Texto do rodap\u00e9"
                  value={form.footer}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, footer: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Live preview panel */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Eye className="h-4 w-4" />
                Pr\u00e9-visualiza\u00e7\u00e3o
              </div>
              <div className="rounded-xl border bg-muted/30 p-4 min-h-[300px]">
                {/* WhatsApp-style message bubble */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-background border shadow-sm p-3 space-y-2">
                    {form.header && (
                      <p className="text-sm font-semibold">{form.header}</p>
                    )}
                    {form.body ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {highlightVariables(form.body)}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        O corpo da mensagem aparecer\u00e1 aqui...
                      </p>
                    )}
                    {form.footer && (
                      <p className="text-xs text-muted-foreground">
                        {form.footer}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 text-right">
                      12:00
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setForm(emptyForm);
                setEditingId(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.body.trim()}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir modelo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este modelo? Esta a\u00e7\u00e3o n\u00e3o pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingId(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
