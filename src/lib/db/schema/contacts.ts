import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { users } from "./users";

export const contacts = sqliteTable("contacts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  // WhatsApp identity (E.164 format, e.g. "5511999998888")
  waId: text("wa_id").notNull(),
  profileName: text("profile_name"),

  // CRM fields
  name: text("name"),
  email: text("email"),
  company: text("company"),

  funnelStage: text("funnel_stage").notNull().default("novo_lead"), // FunnelStage
  tags: text("tags"), // JSON stringified array, e.g. '["vip","recorrente"]'
  notes: text("notes"),

  assignedToId: text("assigned_to_id").references(() => users.id, {
    onDelete: "set null",
  }),

  lastContactedAt: integer("last_contacted_at", { mode: "timestamp" }),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
