import { internalMutation, internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { embed } from "./gemini";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

export const addChunk = internalMutation({
  args: {
    documentId: v.id("documents"),
    text: v.string(),
    pageNumber: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chunks", {
      documentId: args.documentId,
      text: args.text,
      pageNumber: args.pageNumber,
    });
  },
});

export const generateEmbeddings = internalAction({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const chunks = await ctx.runQuery(internal.chunks.getChunksForDocument, { documentId });

    for (const chunk of chunks) {
        if (chunk.embedding) continue;
        const embedding = await embed({ text: chunk.text });
        await ctx.runMutation(internal.chunks.updateChunkEmbedding, {
            chunkId: chunk._id,
            embedding: embedding,
        });
    }
  }
});

export const updateChunkEmbedding = internalMutation({
  args: { chunkId: v.id("chunks"), embedding: v.array(v.float64()) },
  handler: async (ctx, { chunkId, embedding }) => {
    await ctx.db.patch(chunkId, { embedding });
  },
});

export const getChunksForDocument = internalQuery({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    return await ctx.db
      .query("chunks")
      .filter((q) => q.eq(q.field("documentId"), documentId))
      .collect();
  },
});

export const getChunksByIds = internalQuery({
  args: { ids: v.array(v.id("chunks")) },
  handler: async (ctx, args) => {
    const chunks = await Promise.all(
      args.ids.map((id) => ctx.db.get(id))
    );
    return chunks.filter((chunk): chunk is Doc<"chunks"> => chunk !== null);
  },
});
