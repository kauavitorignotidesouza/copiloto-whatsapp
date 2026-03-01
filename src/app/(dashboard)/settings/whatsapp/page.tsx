"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Wifi,
  WifiOff,
  Copy,
  RefreshCw,
  Phone,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function WhatsAppSettingsPage() {
  const [isConnected] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const webhookUrl = "https://seu-dominio.com/api/webhooks/whatsapp";
  const accessToken = "EAABsbCS1iHgBO0vZBZCFJ7kR3mXpNtM9yKlZAHnVzO8G2wP";
  const verifyToken = "meu_token_verificacao_2024";

  function handleCopy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleTestConnection() {
    setIsTesting(true);
    setTimeout(() => setIsTesting(false), 2000);
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Conexão WhatsApp</h1>
        <p className="text-muted-foreground text-sm">
          Configure a conexão com a API do WhatsApp Business para enviar e receber mensagens.
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex items-center justify-center h-14 w-14 rounded-full",
                  isConnected
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                )}
              >
                {isConnected ? (
                  <Wifi className="h-7 w-7 text-green-600 dark:text-green-400" />
                ) : (
                  <WifiOff className="h-7 w-7 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Status da Conexão</h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border-0",
                      isConnected
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    )}
                  >
                    {isConnected ? "Conectado" : "Desconectado"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isConnected
                    ? "A API do WhatsApp Business está funcionando corretamente."
                    : "Sem conexão com a API do WhatsApp Business."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              <RefreshCw className={cn("h-4 w-4", isTesting && "animate-spin")} />
              {isTesting ? "Testando..." : "Testar Conexão"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Credenciais da API</CardTitle>
          <CardDescription>
            Credenciais de acesso à API do WhatsApp Business. Mantenha essas informações em sigilo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumberId">Phone Number ID</Label>
            <div className="flex gap-2">
              <Input
                id="phoneNumberId"
                value="109876543210987"
                readOnly
                className="font-mono bg-muted text-muted-foreground"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => handleCopy("109876543210987", "phoneId")}
              >
                {copied === "phoneId" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAccountId">Business Account ID</Label>
            <div className="flex gap-2">
              <Input
                id="businessAccountId"
                value="210987654321098"
                readOnly
                className="font-mono bg-muted text-muted-foreground"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => handleCopy("210987654321098", "businessId")}
              >
                {copied === "businessId" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <div className="flex gap-2">
              <Input
                id="accessToken"
                value={showToken ? accessToken : "••••••••••••••••••••••••••••••••••••••••"}
                readOnly
                className="font-mono bg-muted text-muted-foreground"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => handleCopy(accessToken, "accessToken")}
              >
                {copied === "accessToken" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verifyToken">Webhook Verify Token</Label>
            <div className="flex gap-2">
              <Input
                id="verifyToken"
                value={verifyToken}
                readOnly
                className="font-mono bg-muted text-muted-foreground"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => handleCopy(verifyToken, "verifyToken")}
              >
                {copied === "verifyToken" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook URL</CardTitle>
          <CardDescription>
            Configure esta URL no painel do Meta Business para receber mensagens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={webhookUrl}
              readOnly
              className="font-mono bg-muted text-muted-foreground"
            />
            <Button
              variant="outline"
              className="gap-2 shrink-0"
              onClick={() => handleCopy(webhookUrl, "webhook")}
            >
              {copied === "webhook" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied === "webhook" ? "Copiado!" : "Copiar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Business Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil do WhatsApp Business</CardTitle>
          <CardDescription>
            Informações do perfil exibidas para seus clientes no WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground/25">
              <Phone className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Loja Exemplo</p>
              <p className="text-sm text-muted-foreground">+55 11 99999-1234</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de exibição</Label>
              <Input
                id="displayName"
                value="Loja Exemplo"
                readOnly
                className="bg-muted text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">Sobre</Label>
              <Input
                id="about"
                value="Sua loja favorita! Atendimento de seg a sex, 9h-18h."
                readOnly
                className="bg-muted text-muted-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Limits */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Limites de mensagens</AlertTitle>
        <AlertDescription>
          Seu plano atual permite o envio de <strong>1.000 mensagens/dia (Tier 1)</strong>.
          Para aumentar o limite, entre em contato com o suporte ou melhore a qualidade
          do seu número no Meta Business.
        </AlertDescription>
      </Alert>
    </div>
  );
}
