import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryAdjuster } from "@/components/admin/inventory-adjuster";

export default async function InventoryPage() {
  await requirePermission("INVENTORY", "VIEW");

  // Fetch Inventory
  // In a real scenario, we'd join with Sanity here to get Product Names.
  // We'll display the Sanity Product ID for now, with a stub for the name.
  const inventory = await prisma.inventory.findMany({
    orderBy: { availableStock: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Manage product stock levels and view transaction history.</p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sanity Product ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Available Stock</TableHead>
              <TableHead>Reserved Stock</TableHead>
              <TableHead>Manual Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => {
              const isLowStock = item.availableStock < 10;
              const isOutOfStock = item.availableStock === 0;

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-xs font-mono">{item.sanityProductId}</TableCell>
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
