import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { contacts } from "./contacts";
import { conversations } from "./conversations";

export const products = sqliteTable("products", {
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
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  stockQuantity: integer("stock_quantity"),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const orders = sqliteTable("orders", {
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

  items: text("items").notNull(), // JSON array of { productId, name, qty, unitPrice }
  totalAmount: real("total_amount").notNull(),
  currency: text("currency").notNull().default("BRL"),

  paymentMethod: text("payment_method"), // "pix" | "credit_card" | "boleto" | etc.
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending" | "paid" | "failed" | "refunded"
  pixCode: text("pix_code"),

  notes: text("notes"),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
