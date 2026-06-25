import { requirePermission } from "@/lib/auth-utils";
// import { Table }
import { readClient } from "@/sanity/lib/client";
import { ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { ProductRowActions }
import { ProductTableClient } from "@/components/admin/product-table-client";

export default async function ProductsPage() {
  await requirePermission("PRODUCTS", "VIEW");

  // Fetch live products directly from your Sanity CMS
  const products = await readClient.fetch(ALL_PRODUCTS_QUERY);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your storefront catalog.</p>
        </div>
        <Link href="/admin/studio">
          <Button>Open Sanity Studio</Button>
        </Link>
      </div>

      <ProductTableClient products={products} />
    </div>
  );
}
