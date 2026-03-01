import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const tenants = sqliteTable("tenants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  // WhatsApp Cloud API credentials
  whatsappPhoneNumberId: text("whatsapp_phone_number_id"),
  whatsappBusinessAccountId: text("whatsapp_business_account_id"),
  whatsappAccessToken: text("whatsapp_access_token"),
  webhookVerifyToken: text("webhook_verify_token"),

  // AI settings
  aiEnabled: integer("ai_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  aiTone: text("ai_tone").notNull().default("professional"),

  // Billing
  plan: text("plan").notNull().default("free"),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
