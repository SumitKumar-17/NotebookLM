import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

// Webhook endpoint to receive parsed data from LlamaParse.
http.route({
  path: "/api/llamaparse",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const documentId = url.searchParams.get("documentId") as Id<"documents">;
    const markdown = await request.text();

    // LlamaParse separates pages with '---'. We split the text by this delimiter.
    const pages = markdown.split("\n---\n");
    const chunks = pages.map((pageContent, i) => ({
      documentId: documentId,
      text: pageContent,
      pageNumber: i + 1,
    }));

    // Save each page as a chunk in the database.
    for (const chunk of chunks) {
      await ctx.runMutation(internal.chunks.addChunk, chunk);
    }
    
    // Schedule embedding generation for all new chunks.
    // This call is now valid because `generateEmbeddings` is an `internalAction`.
    await ctx.scheduler.runAfter(0, internal.chunks.generateEmbeddings, { documentId });

    // Mark document as successfully parsed.
    await ctx.runMutation(internal.documents.updateParsingStatus, {
        documentId: documentId,
        status: "success",
    });

    return new Response(null, { status: 200 });
  }),
});

export default http;