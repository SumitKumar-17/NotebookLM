/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as chat from "../chat.js";
import type * as chunks from "../chunks.js";
import type * as documents from "../documents.js";
import type * as files from "../files.js";
import type * as gemini from "../gemini.js";
import type * as http from "../http.js";
import type * as parser from "../parser.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  chat: typeof chat;
  chunks: typeof chunks;
  documents: typeof documents;
  files: typeof files;
  gemini: typeof gemini;
  http: typeof http;
  parser: typeof parser;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
