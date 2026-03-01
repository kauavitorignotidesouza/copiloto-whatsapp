import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { conversations } from "./conversations";
import { users } from "./users";

export const messages = pgTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),

  waMessageId: text("wa_message_id").unique(),

  direction: text("direction").notNull(),
  type: text("type").notNull().default("text"),

  content: text("content"),
  mediaUrl: text("media_url"),
  mediaMimeType: text("media_mime_type"),
  templateName: text("template_name"),
  metadata: text("metadata"),

  status: text("status").notNull().default("pending"),

  sentById: text("sent_by_id").references(() => users.id, {
    onDelete: "set null",
  }),

  isAiGenerated: boolean("is_ai_generated").notNull().default(false),
  aiSuggestionAccepted: boolean("ai_suggestion_accepted"),

  errorCode: text("error_code"),
  errorMessage: text("error_message"),

  sentAt: timestamp("sent_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  readAt: timestamp("read_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messageStatusEvents = pgTable("message_status_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  messageId: text("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),

  status: text("status").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  rawPayload: text("raw_payload"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MessageStatusEvent = typeof messageStatusEvents.$inferSelect;
export type NewMessageStatusEvent = typeof messageStatusEvents.$inferInsert;
