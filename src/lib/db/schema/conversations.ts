import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { contacts } from "./contacts";
import { users } from "./users";

export const conversations = sqliteTable("conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  contactId: text("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  assignedToId: text("assigned_to_id").references(() => users.id, {
    onDelete: "set null",
  }),

  status: text("status").notNull().default("open"), // ConversationStatus
  subject: text("subject"),

  // Denormalized for fast listing
  lastMessageAt: integer("last_message_at", { mode: "timestamp" }),
  lastMessagePreview: text("last_message_preview"),

  // WhatsApp 24h window tracking
  windowExpiresAt: integer("window_expires_at", { mode: "timestamp" }),

  unreadCount: integer("unread_count").notNull().default(0),
  isBot: integer("is_bot", { mode: "boolean" }).notNull().default(false),

  // Closure tracking
  closedAt: integer("closed_at", { mode: "timestamp" }),
  closedById: text("closed_by_id").references(() => users.id, {
    onDelete: "set null",
  }),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
