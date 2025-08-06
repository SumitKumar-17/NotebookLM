import { internalMutation, internalQuery, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { embed } from "./gemini";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel"; // Import Doc

// Internal mutation to add a text chunk to the database.
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

// Action to generate embeddings for all chunks of a document.
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

// Internal mutation to update a chunk with its generated vector embedding.
export const updateChunkEmbedding = internalMutation({
  args: { chunkId: v.id("chunks"), embedding: v.array(v.float64()) },
  handler: async (ctx, { chunkId, embedding }) => {
    await ctx.db.patch(chunkId, { embedding });
  },
});

// Internal query to retrieve all chunks for a given document.
export const getChunksForDocument = internalQuery({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    return await ctx.db
      .query("chunks")
      .filter((q) => q.eq(q.field("documentId"), documentId))
      .collect();
  },
});

// --- START: NEW FUNCTION TO FIX THE ERROR ---
// Fetches full chunk documents by their IDs.
export const getChunksByIds = internalQuery({
  args: { ids: v.array(v.id("chunks")) },
  handler: async (ctx, args) => {
    const chunks = await Promise.all(
      args.ids.map((id) => ctx.db.get(id))
    );
    // Filter out any null results (if a chunk was deleted)
    return chunks.filter((chunk): chunk is Doc<"chunks"> => chunk !== null);
  },
});
// --- END: NEW FUNCTION ---