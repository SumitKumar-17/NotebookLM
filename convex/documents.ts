import { v } from "convex/values";
import { mutation, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Creates a new document record and schedules parsing in the parser.ts file.
export const createDocument = mutation({
  args: { storageId: v.id("_storage"), name: v.string() },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      name: args.name,
      storageId: args.storageId,
      parsingStatus: "processing",
    });

    // This calls the action in our new parser.ts file.
    await ctx.scheduler.runAfter(0, internal.parser.parseDocument, {
      documentId,
      storageId: args.storageId,
    });

    return documentId;
  },
});

// Internal mutation to update a document's parsing status.
export const updateParsingStatus = internalMutation({
    args: { documentId: v.id("documents"), status: v.string() },
    handler: async (ctx, {documentId, status}) => {
        await ctx.db.patch(documentId, {
            parsingStatus: status as any
        });
    }
});

// Retrieves a document by its ID.
export const getDocument = query({
  args: { id: v.id("documents") }, // <-- This line is now corrected
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Retrieves the public URL for a stored file.
export const getFileUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});