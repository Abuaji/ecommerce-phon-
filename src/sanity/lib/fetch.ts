import "server-only";

import { draftMode } from "next/headers";
import { readClient } from "./client";
import { type QueryParams } from "next-sanity";

const DEFAULT_PARAMS = {} as QueryParams;
const DEFAULT_TAGS = [] as string[];

/**
 * Used to fetch data from Sanity securely on the server.
 * Supports Next.js App Router caching, ISR, and Draft Mode.
 */
export async function sanityFetch<QueryResponse>({
  query,
  params = DEFAULT_PARAMS,
  tags = DEFAULT_TAGS,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
}): Promise<QueryResponse> {
  const isDraftMode = (await draftMode()).isEnabled;
  
  if (isDraftMode && !process.env.SANITY_API_READ_TOKEN) {
    throw new Error(
      "The `SANITY_API_READ_TOKEN` environment variable is required to access drafts."
    );
  }

  // If in draft mode, we bypass cache and fetch raw drafts using the read token
  // If in production, we use Next.js fetch caching (ISR) with cache tags
  return readClient.fetch<QueryResponse>(query, params, {
    ...(isDraftMode && {
      token: process.env.SANITY_API_READ_TOKEN as string,
      perspective: "previewDrafts",
    }),
    next: {
      revalidate: isDraftMode ? 0 : 3600, // Cache for 1 hour by default in production
      tags,
    },
  });
}
