import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryAdjuster } from "@/components/admin/inventory-adjuster";
import { readClient } from "@/sanity/lib/client";

export default async function InventoryPage() {
  await requirePermission("INVENTORY", "VIEW");

  // Fetch Inventory from Postgres
  const inventory = await prisma.inventory.findMany({
    orderBy: { availableStock: "asc" },
  });

  // Fetch Product Details from Sanity to match the IDs
  const sanityProducts = await readClient.fetch(`*[_type == "product"]{
    _id, 
    name, 
    sku,
    "imageUrl": mainImage.asset->url
  }`);

  type SanityProduct = { _id: string; name: string; sku: string; imageUrl?: string };

  // Create a fast lookup map for Sanity products
  const productMap = new Map<string, SanityProduct>(
    (sanityProducts as SanityProduct[]).map((p) => [p._id, p])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Manage product stock levels independently of the Content CMS.</p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Available Stock</TableHead>
              <TableHead>Reserved Stock</TableHead>
              <TableHead>Manual Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => {
              const product = productMap.get(item.sanityProductId);
              const isLowStock = item.availableStock < 10;
              const isOutOfStock = item.availableStock === 0;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product?.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xs">N/A</div>
                      )}
                      <span className="font-medium line-clamp-2 max-w-[250px]">{product?.name || "Unknown Product"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{product?.sku || item.sanityProductId}</TableCell>
                  <TableCell>
                    {isOutOfStock ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : isLowStock ? (
                      <Badge variant="outline" className="text-orange-500 border-orange-500">Low Stock</Badge>
                    ) : (
                      <Badge variant="secondary">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-lg font-semibold">{item.availableStock}</TableCell>
                  <TableCell className="text-muted-foreground">{item.reservedStock}</TableCell>
                  <TableCell>
                    <InventoryAdjuster inventoryId={item.id} />
                  </TableCell>
                </TableRow>
              );
            })}
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No inventory records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
