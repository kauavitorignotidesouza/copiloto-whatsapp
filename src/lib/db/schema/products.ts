import { pgTable, text, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { contacts } from "./contacts";
import { conversations } from "./conversations";

export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku"),
  price: real("price"),
  currency: text("currency").notNull().default("BRL"),
  imageUrl: text("image_url"),
  category: text("category"),
  isActive: boolean("is_active").notNull().default(true),
  stockQuantity: integer("stock_quantity"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  contactId: text("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  conversationId: text("conversation_id").references(() => conversations.id, {
    onDelete: "set null",
  }),

  items: text("items").notNull(),
  totalAmount: real("total_amount").notNull(),
  currency: text("currency").notNull().default("BRL"),

  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  pixCode: text("pix_code"),

  notes: text("notes"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
