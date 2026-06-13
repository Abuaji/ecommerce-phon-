import { requirePermission } from "@/lib/auth-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { readClient } from "@/sanity/lib/client";
import { ALL_PRODUCTS_QUERY } from "@/sanity/queries";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductRowActions } from "@/components/admin/product-row-actions";

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

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product: any) => (
              <TableRow key={product._id}>
                <TableCell>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs">N/A</div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>₹{product.price?.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <ProductRowActions product={product} />
                </TableCell>
              </TableRow>
            ))}
            {(!products || products.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No products found. Click "Open Sanity Studio" to add your first product!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
