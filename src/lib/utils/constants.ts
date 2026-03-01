export const FUNNEL_STAGES = [
  { value: "novo_lead", label: "Novo Lead", color: "bg-blue-500" },
  { value: "qualificacao", label: "Qualificação", color: "bg-yellow-500" },
  { value: "proposta", label: "Proposta", color: "bg-purple-500" },
  { value: "pagamento", label: "Pagamento", color: "bg-orange-500" },
  { value: "pos_venda", label: "Pós-venda", color: "bg-green-500" },
] as const;

export const CONVERSATION_STATUSES = [
  { value: "open", label: "Aberta", color: "bg-green-500" },
  { value: "waiting", label: "Aguardando", color: "bg-yellow-500" },
  { value: "closed", label: "Fechada", color: "bg-gray-500" },
] as const;

export const MESSAGE_STATUSES = [
  { value: "pending", label: "Pendente", icon: "clock" },
  { value: "sent", label: "Enviada", icon: "check" },
  { value: "delivered", label: "Entregue", icon: "check-check" },
  { value: "read", label: "Lida", icon: "check-check-blue" },
  { value: "failed", label: "Falhou", icon: "x" },
] as const;

export const USER_ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "manager", label: "Gerente" },
  { value: "attendant", label: "Atendente" },
] as const;

export const AI_INTENTS = [
  { value: "purchase_intent", label: "Compra", color: "text-green-600", bgColor: "bg-green-100" },
  { value: "support_request", label: "Suporte", color: "text-blue-600", bgColor: "bg-blue-100" },
  { value: "pricing_inquiry", label: "Preço", color: "text-purple-600", bgColor: "bg-purple-100" },
  { value: "complaint", label: "Reclamação", color: "text-red-600", bgColor: "bg-red-100" },
  { value: "general_question", label: "Geral", color: "text-gray-600", bgColor: "bg-gray-100" },
  { value: "scheduling", label: "Agendamento", color: "text-orange-600", bgColor: "bg-orange-100" },
  { value: "payment_status", label: "Pagamento", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { value: "opt_out", label: "Opt-out", color: "text-red-600", bgColor: "bg-red-100" },
] as const;
