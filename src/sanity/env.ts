import { env } from "@/env";

// Re-export Sanity specific environment variables for internal use
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
export const dataset = env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID || "dummy-project-id";
export const useCdn = false; // Always bypass CDN for fresh data, or true if strict caching
