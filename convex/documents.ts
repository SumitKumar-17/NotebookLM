import { v } from "convex/values";
import { mutation, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const createDocument = mutation({
  args: { storageId: v.id("_storage"), name: v.string() },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      name: args.name,
      storageId: args.storageId,
      parsingStatus: "processing",
    });

    await ctx.scheduler.runAfter(0, internal.parser.parseDocument, {
      documentId,
      storageId: args.storageId,
    });

    return documentId;
  },
});

export const updateParsingStatus = internalMutation({
    args: { documentId: v.id("documents"), status: v.string() },
    handler: async (ctx, {documentId, status}) => {
        await ctx.db.patch(documentId, {
            parsingStatus: status as any
        });
    }
});

export const getDocument = query({
  args: { id: v.id("documents") }, 
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getFileUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});