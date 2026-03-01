import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";

export const kbDocuments = sqliteTable("kb_documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  sourceType: text("source_type"), // "file" | "url" | "manual"
  sourceUrl: text("source_url"),
  content: text("content"),

  chunkCount: integer("chunk_count").notNull().default(0),
  status: text("status").notNull().default("processing"), // "processing" | "ready" | "error"

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const kbChunks = sqliteTable("kb_chunks", {
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
  metadata: text("metadata"), // JSON string for embedding vectors, token count, etc.

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type KbDocument = typeof kbDocuments.$inferSelect;
export type NewKbDocument = typeof kbDocuments.$inferInsert;
export type KbChunk = typeof kbChunks.$inferSelect;
export type NewKbChunk = typeof kbChunks.$inferInsert;
