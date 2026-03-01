"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Brain, Sparkles, Shield, Save, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const defaultSystemPrompt = `Você é um assistente de atendimento ao cliente da Loja Exemplo. Seu papel é ajudar os clientes com dúvidas sobre produtos, pedidos e serviços.

Diretrizes:
- Seja educado e prestativo
- Responda sempre em português brasileiro
- Não invente informações sobre preços ou disponibilidade
- Quando não souber a resposta, encaminhe para um atendente humano
- Use o nome do cliente quando disponível
- Mantenha as respostas concisas e objetivas`;

export default function AISettingsPage() {
  const [copilotEnabled, setCopilotEnabled] = useState(true);
  const [model, setModel] = useState("claude-haiku");
  const [tone, setTone] = useState("amigavel");
  const [temperature, setTemperature] = useState([0.3]);
  const [maxContext, setMaxContext] = useState([5]);
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);

  // Guardrails
  const [neverInventPrices, setNeverInventPrices] = useState(true);
  const [neverPromiseStock, setNeverPromiseStock] = useState(true);
  const [alwaysSuggestNeverSend, setAlwaysSuggestNeverSend] = useState(true);
  const [respectOptOut, setRespectOptOut] = useState(true);

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Configuração de IA</h1>
        <p className="text-muted-foreground text-sm">
          Ajuste o comportamento do copiloto de IA, tom de voz e preferências de respostas automáticas.
        </p>
      </div>

      {/* Master Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex items-center justify-center h-12 w-12 rounded-full",
                  copilotEnabled
                    ? "bg-purple-100 dark:bg-purple-900/30"
                    : "bg-muted"
                )}
              >
                <Brain
                  className={cn(
                    "h-6 w-6",
                    copilotEnabled
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-muted-foreground"
                  )}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Copiloto IA</h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border-0",
                      copilotEnabled
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    )}
                  >
                    {copilotEnabled ? "Ativo" : "Desativado"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  O copiloto sugere respostas automáticas para seus atendentes durante conversas.
                </p>
              </div>
            </div>
            <Switch
              checked={copilotEnabled}
              onCheckedChange={setCopilotEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Model & Tone */}
      <Card className={cn(!copilotEnabled && "opacity-60 pointer-events-none")}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Modelo e Comportamento</CardTitle>
          </div>
          <CardDescription>
            Escolha o modelo de IA e ajuste o estilo de comunicação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo de IA</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-haiku">
                    Claude Haiku (rápido)
                  </SelectItem>
                  <SelectItem value="claude-sonnet">
                    Claude Sonnet (equilibrado)
                  </SelectItem>
                  <SelectItem value="claude-opus">
                    Claude Opus (máximo)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tom de voz</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amigavel">Amigável</SelectItem>
                  <SelectItem value="profissional">Profissional</SelectItem>
                  <SelectItem value="neutro">Neutro</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Temperatura</Label>
                <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {temperature[0].toFixed(1)}
                </span>
              </div>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                min={0}
                max={1}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Valores baixos geram respostas mais focadas. Valores altos aumentam a criatividade.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Contexto máximo</Label>
                <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {maxContext[0]} {maxContext[0] === 1 ? "mensagem" : "mensagens"}
                </span>
              </div>
              <Slider
                value={maxContext}
                onValueChange={setMaxContext}
                min={1}
                max={10}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Quantidade de mensagens anteriores usadas como contexto para gerar a resposta.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guardrails */}
      <Card className={cn(!copilotEnabled && "opacity-60 pointer-events-none")}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Guardrails</CardTitle>
          </div>
          <CardDescription>
            Regras de segurança para controlar o que a IA pode ou não fazer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Nunca inventar preços</Label>
              <p className="text-xs text-muted-foreground">
                A IA não irá criar ou estimar preços de produtos.
              </p>
            </div>
            <Switch
              checked={neverInventPrices}
              onCheckedChange={setNeverInventPrices}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Nunca prometer estoque</Label>
              <p className="text-xs text-muted-foreground">
                A IA não irá confirmar disponibilidade de estoque sem verificar.
              </p>
            </div>
            <Switch
              checked={neverPromiseStock}
              onCheckedChange={setNeverPromiseStock}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">
                  Sempre sugerir, nunca enviar sozinho
                </Label>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  Obrigatório
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                A IA sempre sugere respostas para aprovação do atendente antes de enviar.
              </p>
            </div>
            <Switch
              checked={alwaysSuggestNeverSend}
              onCheckedChange={setAlwaysSuggestNeverSend}
              disabled
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">
                Respeitar opt-out automaticamente
              </Label>
              <p className="text-xs text-muted-foreground">
                Parar de usar IA quando o cliente solicitar atendimento humano.
              </p>
            </div>
            <Switch
              checked={respectOptOut}
              onCheckedChange={setRespectOptOut}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card className={cn(!copilotEnabled && "opacity-60 pointer-events-none")}>
        <CardHeader>
          <CardTitle>Prompt do Sistema</CardTitle>
          <CardDescription>
            Instruções base que definem o comportamento e personalidade da IA. Este texto é
            enviado como contexto em toda conversa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            placeholder="Digite as instruções base para a IA..."
          />
          <p className="text-xs text-muted-foreground">
            {systemPrompt.length} caracteres
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" className="gap-2">
          <FlaskConical className="h-4 w-4" />
          Testar Copiloto
        </Button>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
