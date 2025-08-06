import { mutation } from "./_generated/server";

// Generates a short-lived URL for file uploads.
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});