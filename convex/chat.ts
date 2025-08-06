import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { embed } from "./gemini";

export const getMessages = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_documentId", (q) => q.eq("documentId", args.documentId))
            .collect();
    },
});

export const sendMessage = action({
  args: { message: v.string(), documentId: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.chat.internalSaveMessage, {
      documentId: args.documentId,
      text: args.message,
      isUser: true,
    });

    const questionEmbedding = await embed({ text: args.message });

    const searchResults = await ctx.vectorSearch("chunks", "by_embedding", {
      vector: questionEmbedding,
      limit: 5,
      filter: (q) => q.eq("documentId", args.documentId),
    });
    const relevantChunkIds = searchResults.map(item => item._id);

    const relevantChunks = await ctx.runQuery(internal.chunks.getChunksByIds, {
        ids: relevantChunkIds
    });
    
    const contextChunks = relevantChunks.map(chunk => ({
        text: chunk.text,
        pageNumber: chunk.pageNumber
    }));
    const answer = await ctx.runAction(api.gemini.answer, {
      question: args.message,
      contextChunks: contextChunks,
    });
    
    await ctx.runMutation(internal.chat.internalSaveMessage, {
        documentId: args.documentId,
        text: answer,
        isUser: false,
    });
  },
});

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