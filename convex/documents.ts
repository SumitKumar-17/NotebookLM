import { v } from "convex/values";
import { mutation, internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const LLAMAPARSE_API_KEY = process.env.LLAMAPARSE_API_KEY!;
const APP_URL = process.env.APP_URL!;

// Creates a new document record and schedules parsing.
export const createDocument = mutation({
  args: { storageId: v.id("_storage"), name: v.string() },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      name: args.name,
      storageId: args.storageId,
      parsingStatus: "processing",
    });

    await ctx.scheduler.runAfter(0, internal.documents.parseDocument, {
      documentId,
      storageId: args.storageId,
      fileName: args.name,
    });

    return documentId;
  },
});

// Action to call the LlamaParse API by sending the file content directly.
export const parseDocument = internalAction({
  args: {
    documentId: v.id("documents"),
    storageId: v.id("_storage"),
    fileName: v.string(), // Pass the file name
  },
  handler: async (ctx, args) => {
    // --- START: REVISED LOGIC ---
    // 1. Get the file content from Convex Storage
    const file = await ctx.storage.get(args.storageId);
    if (!file) {
      await ctx.runMutation(internal.documents.updateParsingStatus, {
        documentId: args.documentId,
        status: "failed",
      });
      throw new Error("File not found in storage");
    }

    // 2. Prepare the request as multipart/form-data
    const webhookUrl = `${APP_URL}/api/llamaparse?documentId=${args.documentId}`;
    const formData = new FormData();
    formData.append("file", new Blob([file]), args.fileName);
    formData.append("result_type", "markdown");
    formData.append("webhook_url", webhookUrl);

    // 3. Send the file content to LlamaParse
    const response = await fetch("https://api.cloud.llamaindex.ai/api/parsing/upload", {
      method: "POST",
      headers: {
        // NOTE: Do NOT set Content-Type. The browser's `fetch` API will automatically
        // set the correct 'multipart/form-data' boundary.
        Authorization: `Bearer ${LLAMAPARSE_API_KEY}`,
      },
      body: formData,
    });
    // --- END: REVISED LOGIC ---

    if (!response.ok) {
        const errorText = await response.text();
        console.error("LlamaParse API error:", errorText);
        await ctx.runMutation(internal.documents.updateParsingStatus, {
            documentId: args.documentId,
            status: "failed"
        });
    }
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
  args: { id: v.id("documents") },
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