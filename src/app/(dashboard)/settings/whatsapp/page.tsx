"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  Loader2,
  Save,
  QrCode,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function WhatsAppSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<"success" | "error" | null>(null);

  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessTokenMasked, setAccessTokenMasked] = useState("");
  const [hasAccessToken, setHasAccessToken] = useState(false);

  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState<{
    available: boolean;
    message?: string;
    base64?: string | null;
    pairingCode?: string | null;
    error?: string;
  } | null>(null);

  const [evolutionConnected, setEvolutionConnected] = useState<boolean | null>(null);
  const [webhookInput, setWebhookInput] = useState("");
  const [webhookCurrent, setWebhookCurrent] = useState<string | null>(null);
  const [webhookSaving, setWebhookSaving] = useState(false);
  const [webhookMsg, setWebhookMsg] = useState<"success" | "error" | null>(null);

  const webhookUrl =
    (typeof window !== "undefined" ? window.location.origin : "") + "/api/webhooks/whatsapp";

  useEffect(() => {
    fetch("/api/settings/whatsapp")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar");
        return res.json();
      })
      .then((data) => {
        setPhoneNumberId(data.whatsappPhoneNumberId ?? "");
        setBusinessAccountId(data.whatsappBusinessAccountId ?? "");
        setAccessTokenMasked(data.accessTokenMasked ?? "");
        setHasAccessToken(Boolean(data.hasAccessToken));
      })
      .catch(() => setSaveMessage("error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const checkEvolution = () => {
      fetch("/api/settings/whatsapp/evolution-status")
        .then((res) => res.json())
        .then((data) => setEvolutionConnected(data.connected === true))
        .catch(() => setEvolutionConnected(false));
    };
    checkEvolution();
    const id = setInterval(checkEvolution, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/settings/whatsapp/webhook")
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setWebhookCurrent(data.url);
          setWebhookInput(data.url.replace(/\/api\/webhooks\/evolution$/, ""));
        }
      })
      .catch(() => {});
  }, []);

  const isConnected = Boolean(phoneNumberId.trim() && (accessToken.trim() || hasAccessToken));

  function handleCopy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleTestConnection() {
    setIsTesting(true);
    setTimeout(() => setIsTesting(false), 2000);
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/settings/whatsapp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappPhoneNumberId: phoneNumberId.trim() || undefined,
          whatsappBusinessAccountId: businessAccountId.trim() || undefined,
          whatsappAccessToken: accessToken.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setSaveMessage("success");
      if (accessToken.trim()) {
        setHasAccessToken(true);
        setAccessTokenMasked(accessToken.slice(0, 6) + "••••••" + accessToken.slice(-4));
        setAccessToken("");
      }
    } catch {
      setSaveMessage("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveWebhook() {
    setWebhookSaving(true);
    setWebhookMsg(null);
    try {
      const base = webhookInput.trim().replace(/\/$/, "");
      if (!base) throw new Error("URL vazia");
      const fullUrl = `${base}/api/webhooks/evolution`;
      const res = await fetch("/api/settings/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setWebhookCurrent(fullUrl);
      setWebhookMsg("success");
    } catch {
      setWebhookMsg("error");
    } finally {
      setWebhookSaving(false);
    }
  }

  async function handleGerarQr() {
    setQrLoading(true);
    setQrData(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);
    try {
      const res = await fetch("/api/settings/whatsapp/qr", { signal: controller.signal });
      const data = await res.json();
      setQrData(data);
    } catch (e) {
      const isAbort = e instanceof Error && e.name === "AbortError";
      setQrData({
        available: true,
        error: isAbort
          ? "Demorou muito. Verifique se a Evolution API está acessível (IP, porta e firewall)."
          : "Erro ao carregar. Verifique o console do navegador.",
      });
    } finally {
      clearTimeout(timeoutId);
      setQrLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Conexão WhatsApp</h1>
        <p className="text-muted-foreground text-sm">
          Escolha como conectar: API Oficial do Meta (número Business) ou conexão por QR (WhatsApp pessoal ou Business app). Cada conta tem seus próprios chats, produtos e CRM.
        </p>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="api" className="gap-2">
            <Phone className="h-4 w-4" />
            API Oficial (Meta)
          </TabsTrigger>
          <TabsTrigger value="qrcode" className="gap-2">
            <QrCode className="h-4 w-4" />
            Conexão por QR
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6 mt-0">
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
                    ? "Phone Number ID e Access Token configurados. Configure o webhook no Meta para receber mensagens."
                    : "Preencha Phone Number ID e Access Token abaixo e salve."}
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
            Dados do app no Meta for Developers. Salve para que o webhook e o envio de mensagens funcionem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumberId">Phone Number ID</Label>
            <div className="flex gap-2">
              <Input
                id="phoneNumberId"
                placeholder="Ex: 109876543210987"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="font-mono"
              />
              {phoneNumberId && (
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => handleCopy(phoneNumberId, "phoneId")}
                >
                  {copied === "phoneId" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAccountId">Business Account ID (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="businessAccountId"
                placeholder="Ex: 210987654321098"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                className="font-mono"
              />
              {businessAccountId && (
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => handleCopy(businessAccountId, "businessId")}
                >
                  {copied === "businessId" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <div className="flex gap-2">
              <Input
                id="accessToken"
                type={showToken ? "text" : "password"}
                placeholder={hasAccessToken ? "Deixe em branco para manter o atual" : "Token permanente da API"}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="font-mono"
              />
              {hasAccessToken && !accessToken && (
                <span className="text-sm text-muted-foreground self-center shrink-0">
                  {accessTokenMasked}
                </span>
              )}
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
              {accessToken && (
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
              )}
            </div>
          </div>

          {saveMessage === "success" && (
            <p className="text-sm text-green-600 dark:text-green-400">Configuração salva com sucesso.</p>
          )}
          {saveMessage === "error" && (
            <p className="text-sm text-destructive">Erro ao carregar ou salvar. Tente novamente.</p>
          )}

          <Button className="gap-2" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar configuração
          </Button>
        </CardContent>
      </Card>

      {/* Webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook URL</CardTitle>
          <CardDescription>
            No Meta for Developers → Seu app → WhatsApp → Configuração, defina esta URL como URL de callback e assine o campo &quot;messages&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Verify token</AlertTitle>
            <AlertDescription>
              No mesmo passo do webhook, defina um &quot;Verify token&quot; (qualquer texto secreto). Depois, no servidor (variável de ambiente <code>WHATSAPP_VERIFY_TOKEN</code> no .env.local ou na Netlify), use o mesmo valor. Assim o Meta consegue validar a URL.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Alert>
        <Phone className="h-4 w-4" />
        <AlertTitle>Para as conversas aparecerem no Inbox</AlertTitle>
        <AlertDescription>
          (1) Salve aqui o <strong>Phone Number ID</strong> e o <strong>Access Token</strong> do seu número no Meta. (2) Configure o webhook no Meta com a URL acima e o campo &quot;messages&quot; assinado. (3) Defina <strong>WHATSAPP_VERIFY_TOKEN</strong> no servidor igual ao Verify token do Meta. Quando alguém enviar mensagem para seu número WhatsApp Business, a conversa surgirá no Inbox.
        </AlertDescription>
      </Alert>
        </TabsContent>

        <TabsContent value="qrcode" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Conectar por QR Code
                  </CardTitle>
                  <CardDescription>
                    Conecte seu WhatsApp (pessoal ou Business app) escaneando o QR code com o celular. Os chats, produtos e CRM desta conta ficam separados das outras.
                  </CardDescription>
                </div>
                {evolutionConnected !== null && (
                  <Badge
                    variant={evolutionConnected ? "default" : "secondary"}
                    className={cn(
                      "shrink-0",
                      evolutionConnected
                        ? "bg-green-600 hover:bg-green-600"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {evolutionConnected ? "Conectado" : "Desconectado"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrData?.available === false && qrData.message && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>{qrData.message}</AlertDescription>
                </Alert>
              )}
              {qrData?.error && (
                <Alert variant="destructive">
                  <AlertDescription className="break-words">{qrData.error}</AlertDescription>
                </Alert>
              )}
              {qrData?.base64 && (
                <div className="flex flex-col items-center gap-3">
                  <Image
                    src={qrData.base64}
                    alt="QR Code WhatsApp"
                    width={280}
                    height={280}
                    unoptimized
                    className="rounded-lg border bg-white p-2 max-w-[280px] h-auto"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Abra o WhatsApp no celular → Aparelhos conectados → Conectar um aparelho e escaneie o QR acima.
                  </p>
                </div>
              )}
              {qrData?.pairingCode && !qrData?.base64 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Código de pareamento:</p>
                  <p className="font-mono text-lg tracking-wider bg-muted px-4 py-2 rounded-md inline-block">
                    {qrData.pairingCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    No WhatsApp: Aparelhos conectados → Conectar um aparelho → Vincular com número de telefone e digite o código acima.
                  </p>
                </div>
              )}
              <Button
                onClick={handleGerarQr}
                disabled={qrLoading}
                className="gap-2"
              >
                {qrLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4" />
                )}
                {qrLoading ? "Gerando QR..." : "Gerar QR Code"}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Webhook (receber mensagens)
              </CardTitle>
              <CardDescription>
                Para as mensagens do WhatsApp aparecerem no Inbox, configure a URL pública do seu painel. Se estiver na Vercel, use a URL do deploy (ex.: https://seu-app.vercel.app).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookBase">URL pública do painel</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhookBase"
                    placeholder="https://seu-app.vercel.app"
                    value={webhookInput}
                    onChange={(e) => setWebhookInput(e.target.value)}
                    className="font-mono"
                  />
                  <Button
                    onClick={handleSaveWebhook}
                    disabled={webhookSaving || !webhookInput.trim()}
                    className="gap-2 shrink-0"
                  >
                    {webhookSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar
                  </Button>
                </div>
                {webhookCurrent && (
                  <p className="text-xs text-muted-foreground">
                    Webhook atual: <code className="bg-muted px-1 rounded">{webhookCurrent}</code>
                  </p>
                )}
                {webhookMsg === "success" && (
                  <p className="text-sm text-green-600 dark:text-green-400">Webhook configurado com sucesso!</p>
                )}
                {webhookMsg === "error" && (
                  <p className="text-sm text-destructive">Erro ao configurar webhook. Gere o QR Code primeiro, depois configure o webhook.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
