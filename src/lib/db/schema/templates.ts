import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";

export const waTemplates = sqliteTable("wa_templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  waTemplateId: text("wa_template_id"), // ID returned by the WhatsApp API
  name: text("name").notNull(),
  language: text("language").notNull().default("pt_BR"),
  category: text("category"), // "MARKETING" | "UTILITY" | "AUTHENTICATION"

  status: text("status").notNull().default("pending"), // TemplateStatus

  // Template components
  headerType: text("header_type"), // "text" | "image" | "video" | "document"
  headerContent: text("header_content"),
  bodyText: text("body_text"),
  footerText: text("footer_text"),
  buttons: text("buttons"), // JSON array of button objects
  exampleValues: text("example_values"), // JSON array of example variable values

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type WaTemplate = typeof waTemplates.$inferSelect;
export type NewWaTemplate = typeof waTemplates.$inferInsert;
