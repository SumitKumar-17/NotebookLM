"use node"; 
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import pdf2md from "@opendocsg/pdf2md"; 
export const parseDocument = internalAction({
  args: {
    documentId: v.id("documents"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.storage.get(args.storageId);
    if (!file) {
      throw new Error("File not found in storage");
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const markdownText = await pdf2md(buffer);
    
    const chunks = markdownText.split("\n\n").map((chunk) => ({
        documentId: args.documentId,
        pageNumber: 1, 
        text: chunk.trim(),
    }));
    
    for (const chunk of chunks) {
        if (chunk.text !== "") {
            await ctx.runMutation(internal.chunks.addChunk, chunk);
        }
    }

    await ctx.scheduler.runAfter(0, internal.chunks.generateEmbeddings, { documentId: args.documentId });

    await ctx.runMutation(internal.documents.updateParsingStatus, {
        documentId: args.documentId,
        status: "success",
    });
  },
});