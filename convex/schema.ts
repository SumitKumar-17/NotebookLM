import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    name: v.string(),
    storageId: v.id("_storage"),
    parsingStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("success"),
      v.literal("failed")
    )),
  }).index("by_storageId", ["storageId"]),
  chunks: defineTable({
    documentId: v.id("documents"),
    text: v.string(),
    pageNumber: v.number(),
    embedding: v.optional(v.array(v.float64())),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 768, // Gemini embedding-001 dimensions
    filterFields: ["documentId"],
  }),
  messages: defineTable({
    documentId: v.id("documents"),
    text: v.string(),
    isUser: v.boolean(),
  }).index("by_documentId", ["documentId"]),
});