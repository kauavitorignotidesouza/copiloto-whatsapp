// SQLite doesn't support native enums, so we define string literal types
// and use them as type constraints throughout the schema.

export const userRoles = ["admin", "manager", "attendant"] as const;
export type UserRole = (typeof userRoles)[number];

export const conversationStatuses = ["open", "waiting", "closed"] as const;
export type ConversationStatus = (typeof conversationStatuses)[number];

export const messageDirections = ["inbound", "outbound"] as const;
export type MessageDirection = (typeof messageDirections)[number];

export const messageTypes = [
  "text",
  "image",
  "video",
  "audio",
  "document",
  "sticker",
  "location",
  "template",
  "interactive",
] as const;
export type MessageType = (typeof messageTypes)[number];

export const messageStatuses = [
  "pending",
  "sent",
  "delivered",
  "read",
  "failed",
] as const;
export type MessageStatus = (typeof messageStatuses)[number];

export const funnelStages = [
  "novo_lead",
  "qualificacao",
  "proposta",
  "pagamento",
  "pos_venda",
] as const;
export type FunnelStage = (typeof funnelStages)[number];

export const templateStatuses = ["pending", "approved", "rejected"] as const;
export type TemplateStatus = (typeof templateStatuses)[number];

export const optEventTypes = ["opt_in", "opt_out"] as const;
export type OptEventType = (typeof optEventTypes)[number];
