import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { conversations } from "./conversations";
import { users } from "./users";

export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),

  waMessageId: text("wa_message_id").unique(), // WhatsApp message ID (wamid.xxx)

  direction: text("direction").notNull(), // MessageDirection: "inbound" | "outbound"
  type: text("type").notNull().default("text"), // MessageType

  // Content
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaMimeType: text("media_mime_type"),
  templateName: text("template_name"),
  metadata: text("metadata"), // JSON string for extra data (buttons, location coords, etc.)

  // Status tracking
  status: text("status").notNull().default("pending"), // MessageStatus

  // Sender info (for outbound messages)
  sentById: text("sent_by_id").references(() => users.id, {
    onDelete: "set null",
  }),

  // AI flags
  isAiGenerated: integer("is_ai_generated", { mode: "boolean" })
    .notNull()
    .default(false),
  aiSuggestionAccepted: integer("ai_suggestion_accepted", {
    mode: "boolean",
  }),

  // Error handling
  errorCode: text("error_code"),
  errorMessage: text("error_message"),

  // Delivery timestamps
  sentAt: integer("sent_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  readAt: integer("read_at", { mode: "timestamp" }),

  // Created timestamp
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const messageStatusEvents = sqliteTable("message_status_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  messageId: text("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),

  status: text("status").notNull(), // MessageStatus
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  rawPayload: text("raw_payload"), // JSON string of the webhook payload

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MessageStatusEvent = typeof messageStatusEvents.$inferSelect;
export type NewMessageStatusEvent = typeof messageStatusEvents.$inferInsert;
