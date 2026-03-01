"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  FileText,
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  Database,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DocType = "faq" | "catalogo" | "politica" | "procedimento" | "outro";
type DocStatus = "processed" | "processing";

interface KBDocument {
  id: string;
  name: string;
  type: DocType;
  chunks: number;
  size: string;
  uploadedAt: string;
  status: DocStatus;
}

interface KBChunk {
  index: number;
  content: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockDocuments: KBDocument[] = [
  {
    id: "kb1",
    name: "FAQ - Perguntas Frequentes",
    type: "faq",
    chunks: 45,
    size: "12 KB",
    uploadedAt: "ha 2 dias",
    status: "processed",
  },
  {
    id: "kb2",
    name: "Catalogo de Produtos 2024",
    type: "catalogo",
    chunks: 128,
    size: "45 KB",
    uploadedAt: "ha 1 semana",
    status: "processed",
  },
  {
    id: "kb3",
    name: "Politica de Trocas e Devolucoes",
    type: "politica",
    chunks: 23,
    size: "8 KB",
    uploadedAt: "ha 3 dias",
    status: "processed",
  },
  {
    id: "kb4",
    name: "Manual de Atendimento",
    type: "procedimento",
    chunks: 67,
    size: "22 KB",
    uploadedAt: "ha 5 dias",
    status: "processed",
  },
  {
    id: "kb5",
    name: "Tabela de Precos Atacado",
    type: "catalogo",
    chunks: 34,
    size: "15 KB",
    uploadedAt: "ha 1 dia",
    status: "processed",
  },
  {
    id: "kb6",
    name: "Promocoes Marco 2024",
    type: "catalogo",
    chunks: 0,
    size: "5 KB",
    uploadedAt: "ha 10 min",
    status: "processing",
  },
];

const mockChunks: KBChunk[] = [
  {
    index: 0,
    content:
      "Qual o prazo de entrega? O prazo de entrega varia de 3 a 7 dias uteis dependendo da regiao. Para capitais, o prazo e de 3 dias uteis. Para interior, ate 7 dias uteis.",
  },
  {
    index: 1,
    content:
      "Voces aceitam Pix? Sim! Aceitamos Pix, cartao de credito (ate 12x), cartao de debito e boleto bancario. O Pix tem aprovacao imediata.",
  },
  {
    index: 2,
    content:
      "Como faco para trocar um produto? Para trocas, entre em contato conosco em ate 7 dias apos o recebimento. O produto deve estar na embalagem original.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const typeLabels: Record<DocType, string> = {
  faq: "FAQ",
  catalogo: "Catalogo",
  politica: "Politica",
  procedimento: "Procedimento",
  outro: "Outro",
};

const typeBadgeClasses: Record<DocType, string> = {
  faq: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  catalogo: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  politica: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  procedimento: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  outro: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KBManager() {
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [chunksOpen, setChunksOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KBDocument | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<DocType | "">("");
  const [dragOver, setDragOver] = useState(false);
  const [chunksPage, setChunksPage] = useState(0);

  const totalChunks = mockDocuments.reduce((acc, d) => acc + d.chunks, 0);

  const filtered = mockDocuments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      typeLabels[d.type].toLowerCase().includes(search.toLowerCase()),
  );

  const chunksPerPage = 5;
  const paginatedChunks = mockChunks.slice(
    chunksPage * chunksPerPage,
    (chunksPage + 1) * chunksPerPage,
  );
  const totalChunkPages = Math.ceil(mockChunks.length / chunksPerPage);

  function handleViewChunks(doc: KBDocument) {
    setSelectedDoc(doc);
    setChunksPage(0);
    setChunksOpen(true);
  }

  function resetUploadForm() {
    setUploadTitle("");
    setUploadType("");
    setDragOver(false);
  }

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* Stats bar                                                         */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Documentos</p>
              <p className="text-xl font-bold">{mockDocuments.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
              <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chunks indexados</p>
              <p className="text-xl font-bold">{totalChunks}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
              <RefreshCw className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ultima atualizacao</p>
              <p className="text-xl font-bold">ha 2 horas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Search + add button                                               */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Upload dialog trigger */}
        <Dialog
          open={uploadOpen}
          onOpenChange={(open) => {
            setUploadOpen(open);
            if (!open) resetUploadForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              Adicionar Documento
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Documento</DialogTitle>
              <DialogDescription>
                Envie um arquivo para ser processado e indexado na base de
                conhecimento da IA.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Drag & drop zone */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors",
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  Arraste e solte o arquivo aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  ou selecione um arquivo
                </p>
                <Button variant="outline" size="sm" className="mt-1">
                  Selecionar Arquivo
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Formatos aceitos: .txt, .pdf, .md, .csv
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="doc-title">Titulo do documento</Label>
                <Input
                  id="doc-title"
                  placeholder="Ex: FAQ - Perguntas Frequentes"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              {/* Type select */}
              <div className="space-y-2">
                <Label htmlFor="doc-type">Tipo</Label>
                <Select
                  value={uploadType}
                  onValueChange={(v) => setUploadType(v as DocType)}
                >
                  <SelectTrigger id="doc-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="catalogo">Catalogo</SelectItem>
                    <SelectItem value="politica">Politica</SelectItem>
                    <SelectItem value="procedimento">Procedimento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={() => setUploadOpen(false)}>
                <Database className="h-4 w-4 mr-1.5" />
                Processar e Indexar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Documents grid                                                    */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <Card
            key={doc.id}
            className="group relative overflow-hidden transition-shadow hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm font-medium leading-snug truncate">
                  {doc.name}
                </CardTitle>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] border-0",
                      typeBadgeClasses[doc.type],
                    )}
                  >
                    {typeLabels[doc.type]}
                  </Badge>
                  {doc.status === "processed" ? (
                    <Badge
                      variant="secondary"
                      className="border-0 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-[10px]"
                    >
                      Processado
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="border-0 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 text-[10px] animate-pulse"
                    >
                      <Loader2 className="h-3 w-3 mr-0.5 animate-spin" />
                      Processando...
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
              {/* Metadata */}
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Chunks
                  </span>
                  <span className="font-medium text-foreground">
                    {doc.chunks}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Tamanho
                  </span>
                  <span className="font-medium text-foreground">
                    {doc.size}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Enviado
                  </span>
                  <span className="font-medium text-foreground">
                    {doc.uploadedAt}
                  </span>
                </div>
              </div>

              {/* Processing progress for items still processing */}
              {doc.status === "processing" && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Processando documento...</span>
                    <span>35%</span>
                  </div>
                  <Progress value={35} className="h-1.5" />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => handleViewChunks(doc)}
                  disabled={doc.status === "processing"}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Ver chunks
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Reprocessar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium">Nenhum documento encontrado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tente buscar com outros termos ou adicione um novo documento.
          </p>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Chunks viewer dialog                                              */}
      {/* ----------------------------------------------------------------- */}
      <Dialog open={chunksOpen} onOpenChange={setChunksOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Chunks &mdash;{" "}
              <span className="truncate">{selectedDoc?.name}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedDoc?.chunks} chunks extraidos deste documento.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-3 py-2">
              {paginatedChunks.map((chunk) => (
                <Card key={chunk.index} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        #{chunk.index}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {chunk.content.length} caracteres
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {chunk.content}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {paginatedChunks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum chunk disponivel.
                </p>
              )}
            </div>
          </ScrollArea>

          {/* Pagination */}
          {totalChunkPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Pagina {chunksPage + 1} de {totalChunkPages}
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={chunksPage === 0}
                  onClick={() => setChunksPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={chunksPage >= totalChunkPages - 1}
                  onClick={() => setChunksPage((p) => p + 1)}
                >
                  Proximo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
