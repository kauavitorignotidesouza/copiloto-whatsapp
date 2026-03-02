"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const csvColumns = [
  { field: "nome", description: "Nome do produto", required: true },
  { field: "descricao", description: "Descri\u00e7\u00e3o do produto", required: false },
  { field: "preco", description: "Pre\u00e7o em reais (ex: 189.90)", required: true },
  { field: "categoria", description: "Categoria do produto", required: false },
  { field: "estoque", description: "Quantidade em estoque", required: false },
  { field: "sku", description: "C\u00f3digo SKU \u00fanico", required: false },
];

interface ParsedRow {
  [key: string]: string;
}

function parseCsv(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, h, i) => ({ ...obj, [h.trim()]: values[i]?.trim() || '' }), {} as ParsedRow);
  });
  return { headers, rows };
}

export default function ImportProductsPage() {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const csvContent = "nome,descricao,preco,categoria,estoque\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo_produtos.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert("Por favor, selecione um arquivo .csv");
      return;
    }
    const text = await file.text();
    const { rows } = parseCsv(text);
    if (rows.length === 0) {
      alert("O arquivo CSV est\u00e1 vazio ou n\u00e3o cont\u00e9m dados v\u00e1lidos.");
      return;
    }
    setParsedRows(rows);
    setFileName(file.name);
    setStep("preview");
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset so re-selecting the same file works
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const validRows = parsedRows.filter(r => r.nome && r.preco);
  const errorRows = parsedRows.filter(r => !r.nome || !r.preco);

  return (
    <div className="p-6 space-y-6">
      <Link href="/products" className="text-primary hover:underline text-sm flex items-center gap-1">
        <ArrowLeft className="size-4" /> Voltar para Produtos
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Importar Produtos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Importe produtos em massa a partir de um arquivo CSV.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-4">
        {[
          { num: 1, label: "Upload", key: "upload" as const },
          { num: 2, label: "Pr\u00e9-visualizar", key: "preview" as const },
          { num: 3, label: "Conclu\u00eddo", key: "done" as const },
        ].map((s, i) => {
          const isActive = s.key === step;
          const isDone = (step === "preview" && i === 0) || (step === "done" && i < 2);
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <Separator className="w-8" />}
              <div className={`flex items-center gap-2 ${isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-muted-foreground"}`}>
                <span className={`size-7 rounded-full flex items-center justify-center text-xs font-medium border-2 ${isActive ? "border-primary bg-primary text-primary-foreground" : isDone ? "border-emerald-600 bg-emerald-600 text-white" : "border-muted-foreground/30"}`}>
                  {isDone ? "\u2713" : s.num}
                </span>
                <span className="text-sm font-medium">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {step === "upload" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload zone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enviar arquivo CSV</CardTitle>
              <CardDescription>Arraste e solte ou selecione um arquivo</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="size-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm font-medium">
                  {isDragging ? "Solte o arquivo aqui" : "Arraste seu arquivo CSV aqui"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-3">
                  Formatos aceitos: .csv (m\u00e1x. 10MB)
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="size-4 mr-1.5" /> Baixar modelo CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Format guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="size-4" /> Formato esperado
              </CardTitle>
              <CardDescription>Seu CSV deve conter as seguintes colunas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {csvColumns.map((col) => (
                  <div key={col.field} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{col.field}</code>
                      <span className="text-sm text-muted-foreground">{col.description}</span>
                    </div>
                    {col.required ? (
                      <Badge variant="default" className="text-xs">Obrigat\u00f3rio</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Opcional</Badge>
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="bg-muted/50 rounded-md p-3">
                <p className="text-xs font-medium mb-1">Exemplo:</p>
                <code className="text-xs text-muted-foreground block whitespace-pre">
{`nome,preco,categoria,estoque
Vestido Floral,189.90,Vestidos,12
Nike Air Max,599.90,Cal\u00e7ados,15`}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pr\u00e9-visualiza\u00e7\u00e3o</CardTitle>
            <CardDescription>
              Verifique os dados antes de importar
              {fileName && <span className="ml-2 text-xs">({fileName})</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="size-3 text-emerald-500" /> {validRows.length} produtos v\u00e1lidos
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="size-3 text-yellow-500" /> {errorRows.length} erros
              </Badge>
            </div>

            <div className="border rounded-md overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Nome</th>
                    <th className="px-3 py-2 text-left font-medium">Pre\u00e7o</th>
                    <th className="px-3 py-2 text-left font-medium">Categoria</th>
                    <th className="px-3 py-2 text-left font-medium">Estoque</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => {
                    const isValid = row.nome && row.preco;
                    return (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-2">{row.nome || <span className="text-red-500 italic">vazio</span>}</td>
                        <td className="px-3 py-2">
                          {row.preco ? `R$ ${row.preco.replace('.', ',')}` : <span className="text-red-500 italic">vazio</span>}
                        </td>
                        <td className="px-3 py-2">{row.categoria || "-"}</td>
                        <td className="px-3 py-2">{row.estoque || "-"}</td>
                        <td className="px-3 py-2">
                          {isValid ? (
                            <CheckCircle className="size-4 text-emerald-500" />
                          ) : (
                            <AlertCircle className="size-4 text-yellow-500" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep("upload"); setParsedRows([]); setFileName(""); }}>Voltar</Button>
              <Button onClick={() => setStep("done")} disabled={validRows.length === 0}>
                Importar {validRows.length} produtos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "done" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="size-16 text-emerald-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Importa\u00e7\u00e3o conclu\u00edda!</h2>
            <p className="text-muted-foreground mb-6">
              {validRows.length} produtos foram importados com sucesso para o seu cat\u00e1logo.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep("upload"); setParsedRows([]); setFileName(""); }}>Importar mais</Button>
              <Button asChild>
                <Link href="/products">Ver cat\u00e1logo</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
