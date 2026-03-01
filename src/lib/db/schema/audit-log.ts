import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { users } from "./users";
import { contacts } from "./contacts";

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  userId: text("user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  action: text("action").notNull(), // e.g. "conversation.assigned", "message.sent", "contact.updated"
  resource: text("resource").notNull(), // e.g. "conversation", "message", "contact"
  resourceId: text("resource_id"),
  details: text("details"), // JSON string with additional context

  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const optEvents = sqliteTable("opt_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  contactId: text("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  type: text("type").notNull(), // OptEventType: "opt_in" | "opt_out"
  channel: text("channel").notNull().default("whatsapp"),
  reason: text("reason"),
  evidenceUrl: text("evidence_url"),

  recordedById: text("recorded_by_id").references(() => users.id, {
    onDelete: "set null",
  }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type OptEvent = typeof optEvents.$inferSelect;
export type NewOptEvent = typeof optEvents.$inferInsert;
