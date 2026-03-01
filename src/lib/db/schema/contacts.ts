import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { users } from "./users";

export const contacts = pgTable("contacts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  waId: text("wa_id").notNull(),
  profileName: text("profile_name"),

  name: text("name"),
  email: text("email"),
  company: text("company"),

  funnelStage: text("funnel_stage").notNull().default("novo_lead"),
  tags: text("tags"),
  notes: text("notes"),

  assignedToId: text("assigned_to_id").references(() => users.id, {
    onDelete: "set null",
  }),

  lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
