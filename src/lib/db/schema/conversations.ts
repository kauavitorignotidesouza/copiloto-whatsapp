import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { contacts } from "./contacts";
import { users } from "./users";

export const conversations = pgTable("conversations", {
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

  status: text("status").notNull().default("open"),
  subject: text("subject"),

  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  lastMessagePreview: text("last_message_preview"),

  windowExpiresAt: timestamp("window_expires_at", { withTimezone: true }),

  unreadCount: integer("unread_count").notNull().default(0),
  isBot: boolean("is_bot").notNull().default(false),

  closedAt: timestamp("closed_at", { withTimezone: true }),
  closedById: text("closed_by_id").references(() => users.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
