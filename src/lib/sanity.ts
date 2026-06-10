import { createClient } from "next-sanity";
import { env } from "@/env";

// Initialize Sanity client
export const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false, // Set to true for production read queries
});
