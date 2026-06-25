import { requirePermission } from "@/lib/auth-utils";
import { readClient } from "@/sanity/lib/client";
// import { Table }
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tag, ExternalLink } from "lucide-react";

import { BrandTableClient } from "@/components/admin/brand-table-client";

export const revalidate = 60;

export default async function BrandsPage() {
  await requirePermission("PRODUCTS", "VIEW");

  const brands = await readClient.fetch(`
    *[_type == "brand"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      isActive,
      "logoUrl": logo.asset->url,
      "productCount": count(*[_type == "product" && references(^._id)])
    }
  `);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
            <p className="text-muted-foreground">Brands are managed in Sanity CMS. Use the Studio to add or edit.</p>
          </div>
        </div>
        <Link href="/admin/studio">
          <Button className="gap-2">
            <ExternalLink className="h-4 w-4" /> Open Sanity Studio
          </Button>
        </Link>
      </div>

      <BrandTableClient brands={brands as any[]} />
    </div>
  );
}
