import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";

export const waTemplates = pgTable("wa_templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  waTemplateId: text("wa_template_id"),
  name: text("name").notNull(),
  language: text("language").notNull().default("pt_BR"),
  category: text("category"),

  status: text("status").notNull().default("pending"),

  headerType: text("header_type"),
  headerContent: text("header_content"),
  bodyText: text("body_text"),
  footerText: text("footer_text"),
  buttons: text("buttons"),
  exampleValues: text("example_values"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WaTemplate = typeof waTemplates.$inferSelect;
export type NewWaTemplate = typeof waTemplates.$inferInsert;
