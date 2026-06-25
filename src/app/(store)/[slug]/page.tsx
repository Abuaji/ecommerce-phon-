import { readClient } from "@/sanity/lib/client";
import { PAGE_BY_SLUG_QUERY } from "@/sanity/queries";
import { PortableTextRenderer } from "@/components/store/portable-text-renderer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await readClient.fetch(PAGE_BY_SLUG_QUERY, { slug: resolvedParams.slug }).catch(() => null);
  
  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
  };
}

// PortableText rendering logic moved to a client component to avoid Turbopack 'require' errors

export default async function StaticPage({ params }: PageProps) {
  const resolvedParams = await params;
  const page = await readClient.fetch(PAGE_BY_SLUG_QUERY, { slug: resolvedParams.slug }).catch(() => null);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-12 text-foreground">
        {page.title}
      </h1>
      <div className="prose prose-zinc max-w-none">
        {page.body ? (
          <PortableTextRenderer value={page.body} />
        ) : (
          <p className="text-muted-foreground">This page has no content yet.</p>
        )}
      </div>
    </div>
  );
}
