import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { embed } from "./gemini";
import { Doc, Id } from "./_generated/dataModel";

// Retrieves all messages for a given document.
export const getMessages = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
            .collect();
    },
});

// The main action for handling a user's chat message.
export const sendMessage = action({
  args: { message: v.string(), documentId: v.id("documents") },
  handler: async (ctx, args) => {
    // 1. Save user message.
    await ctx.runMutation(internal.chat.internalSaveMessage, {
      documentId: args.documentId,
      text: args.message,
      isUser: true,
    });

    // 2. Generate embedding for the question.
    const questionEmbedding = await embed({ text: args.message });

    // 3. Find relevant chunk IDs via vector search.
    const searchResults = await ctx.vectorSearch("chunks", "by_embedding", {
      vector: questionEmbedding,
      limit: 5,
      filter: (q) => q.eq("documentId", args.documentId),
    });
    const relevantChunkIds = searchResults.map(item => item._id);

    // --- START: CORRECTED CODE ---
    // 4. Retrieve the full text for the relevant chunks using the new internal query.
    const relevantChunks = await ctx.runQuery(internal.chunks.getChunksByIds, {
        ids: relevantChunkIds
    });
    
    const contextChunks = relevantChunks.map(chunk => ({
        text: chunk.text,
        pageNumber: chunk.pageNumber
    }));
    // --- END: CORRECTED CODE ---

    // 5. Call Gemini to get an answer.
    const answer = await ctx.runAction(api.gemini.answer, {
      question: args.message,
      contextChunks: contextChunks,
    });
    
    // 6. Save AI response.
    await ctx.runMutation(internal.chat.internalSaveMessage, {
        documentId: args.documentId,
        text: answer,
        isUser: false,
    });
  },
});

// Internal mutation to save a message to the database.
export const internalSaveMessage = internalMutation({
    args: { documentId: v.id("documents"), text: v.string(), isUser: v.boolean() },
    handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            documentId: args.documentId,
            text: args.text,
            isUser: args.isUser,
        });
    },
});