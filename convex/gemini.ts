import { action } from "./_generated/server";
import { v } from "convex/values";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const EMBEDDING_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`;
const GENERATE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Generates a vector embedding for a given text using Gemini.
export async function embed(args: { text: string }): Promise<number[]> {
  const req = {
    model: "models/embedding-001",
    content: { parts: [{ text: args.text }] },
  };
  const response = await fetch(EMBEDDING_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!response.ok) {
    throw new Error(`Gemini embedding API error: ${await response.text()}`);
  }
  const data = await response.json();
  return data.embedding.values;
}

// Generates a chat response using Gemini based on a question and context.
export const answer = action({
  args: {
    question: v.string(),
    contextChunks: v.array(v.object({
        pageNumber: v.number(),
        text: v.string(),
    }))
  },
  handler: async (_ctx, args) => {
    const contextText = args.contextChunks
      .map(chunk => `[Content from Page ${chunk.pageNumber}]:\n${chunk.text}`)
      .join("\n\n---\n\n");

    const systemPrompt = `You are an expert assistant for answering questions about a document.
    You will be provided with a user's question and a series of context chunks from the document.
    Your task is to provide a concise and accurate answer based ONLY on the provided context.
    When you use information from a specific page, you MUST cite it at the end of the sentence using the format [Page: X].
    Do not make up information. If the context does not contain the answer, say "I could not find an answer in the document."`;

    const requestBody = {
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nContext:\n${contextText}\n\nQuestion:\n${args.question}` }]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
    };

    const response = await fetch(GENERATE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${await response.text()}`);
    }

    const responseData = await response.json();
    return responseData.candidates[0].content.parts[0].text;
  },
});