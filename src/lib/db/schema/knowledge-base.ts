import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";

export const kbDocuments = pgTable("kb_documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  sourceType: text("source_type"),
  sourceUrl: text("source_url"),
  content: text("content"),

  chunkCount: integer("chunk_count").notNull().default(0),
  status: text("status").notNull().default("processing"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const kbChunks = pgTable("kb_chunks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  documentId: text("document_id")
    .notNull()
    .references(() => kbDocuments.id, { onDelete: "cascade" }),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  metadata: text("metadata"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type KbDocument = typeof kbDocuments.$inferSelect;
export type NewKbDocument = typeof kbDocuments.$inferInsert;
export type KbChunk = typeof kbChunks.$inferSelect;
export type NewKbChunk = typeof kbChunks.$inferInsert;
