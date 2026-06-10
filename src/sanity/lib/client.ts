import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, useCdn } from "../env";
import { env } from "@/env";

// Standard read client (useful for generic public queries)
export const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  ...(env.SANITY_API_READ_TOKEN && { token: env.SANITY_API_READ_TOKEN }),
  perspective: "published",
});

// Write client (must never be exposed to the browser)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Never use CDN for writes
  ...(env.SANITY_API_WRITE_TOKEN && { token: env.SANITY_API_WRITE_TOKEN }),
  perspective: "raw", // Bypass edge cache for mutations
});
