"use node"; // This directive is still needed.

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import pdf2md from "@opendocsg/pdf2md"; // <-- Import the new library

// This action will run in the Node.js runtime
export const parseDocument = internalAction({
  args: {
    documentId: v.id("documents"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // 1. Get the file from Convex Storage.
    const file = await ctx.storage.get(args.storageId);
    if (!file) {
      throw new Error("File not found in storage");
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Parse the PDF directly into Markdown text.
    const markdownText = await pdf2md(buffer);
    
    // 3. Split the Markdown text into chunks.
    const chunks = markdownText.split("\n\n").map((chunk) => ({
        documentId: args.documentId,
        pageNumber: 1, // The library provides full-text markdown
        text: chunk.trim(),
    }));
    
    // 4. Save non-empty chunks.
    for (const chunk of chunks) {
        if (chunk.text !== "") {
            await ctx.runMutation(internal.chunks.addChunk, chunk);
        }
    }

    // 5. Schedule embedding generation.
    await ctx.scheduler.runAfter(0, internal.chunks.generateEmbeddings, { documentId: args.documentId });

    // 6. Mark parsing as complete.
    await ctx.runMutation(internal.documents.updateParsingStatus, {
        documentId: args.documentId,
        status: "success",
    });
  },
});