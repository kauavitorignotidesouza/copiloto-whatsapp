"use client";

import { useState } from "react";
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
  { field: "descricao", description: "Descrição do produto", required: false },
  { field: "preco", description: "Preço em reais (ex: 189.90)", required: true },
  { field: "categoria", description: "Categoria do produto", required: false },
  { field: "estoque", description: "Quantidade em estoque", required: false },
  { field: "sku", description: "Código SKU único", required: false },
];

export default function ImportProductsPage() {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");

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
          { num: 2, label: "Pré-visualizar", key: "preview" as const },
          { num: 3, label: "Concluído", key: "done" as const },
        ].map((s, i) => {
          const isActive = s.key === step;
          const isDone = (step === "preview" && i === 0) || (step === "done" && i < 2);
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <Separator className="w-8" />}
              <div className={`flex items-center gap-2 ${isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-muted-foreground"}`}>
                <span className={`size-7 rounded-full flex items-center justify-center text-xs font-medium border-2 ${isActive ? "border-primary bg-primary text-primary-foreground" : isDone ? "border-emerald-600 bg-emerald-600 text-white" : "border-muted-foreground/30"}`}>
                  {isDone ? "✓" : s.num}
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
              <div
                className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setStep("preview")}
              >
                <Upload className="size-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm font-medium">Arraste seu arquivo CSV aqui</p>
                <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-3">
                  Formatos aceitos: .csv, .xlsx (máx. 10MB)
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm">
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
                      <Badge variant="default" className="text-xs">Obrigatório</Badge>
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
Nike Air Max,599.90,Calçados,15`}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pré-visualização</CardTitle>
            <CardDescription>Verifique os dados antes de importar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="size-3 text-emerald-500" /> 8 produtos válidos
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="size-3 text-yellow-500" /> 0 erros
              </Badge>
            </div>

            <div className="border rounded-md overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Nome</th>
                    <th className="px-3 py-2 text-left font-medium">Preço</th>
                    <th className="px-3 py-2 text-left font-medium">Categoria</th>
                    <th className="px-3 py-2 text-left font-medium">Estoque</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Vestido Floral Primavera", price: "189,90", cat: "Vestidos", stock: 12 },
                    { name: "Vestido Rosa Blush", price: "229,90", cat: "Vestidos", stock: 8 },
                    { name: "Nike Air Max 90", price: "599,90", cat: "Calçados", stock: 15 },
                    { name: "Kit Skincare Premium", price: "349,90", cat: "Cosméticos", stock: 6 },
                    { name: "Camiseta Básica Algodão", price: "49,90", cat: "Camisetas", stock: 45 },
                  ].map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2">R$ {item.price}</td>
                      <td className="px-3 py-2">{item.cat}</td>
                      <td className="px-3 py-2">{item.stock}</td>
                      <td className="px-3 py-2"><CheckCircle className="size-4 text-emerald-500" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("upload")}>Voltar</Button>
              <Button onClick={() => setStep("done")}>Importar 8 produtos</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "done" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="size-16 text-emerald-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Importação concluída!</h2>
            <p className="text-muted-foreground mb-6">
              8 produtos foram importados com sucesso para o seu catálogo.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("upload")}>Importar mais</Button>
              <Button asChild>
                <Link href="/products">Ver catálogo</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
