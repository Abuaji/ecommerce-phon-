import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReturnStatusUpdater } from "@/components/admin/return-status-updater";
import { RotateCcw } from "lucide-react";

export const revalidate = 0;

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  ITEM_RECEIVED: "bg-purple-100 text-purple-800",
  REFUND_PROCESSED: "bg-teal-100 text-teal-800",
  REPLACEMENT_SENT: "bg-indigo-100 text-indigo-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export default async function ReturnsPage() {
  await requirePermission("ORDERS", "VIEW");

  const returns = await prisma.return.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, email: true } },
      returnItems: { include: { orderItem: { select: { productNameSnap: true, quantity: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <RotateCcw className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Returns</h1>
          <p className="text-muted-foreground">Manage customer return and refund requests.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.map((ret) => (
              <TableRow key={ret.id}>
                <TableCell>
                  <div className="font-medium text-sm">{ret.customer.name || "Guest"}</div>
                  <div className="text-xs text-muted-foreground">{ret.customer.email}</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {ret.returnItems.map((ri) => (
                      <div key={ri.id} className="text-xs text-muted-foreground">
                        {ri.orderItem.productNameSnap} × {ri.quantity}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{ret.type.replace(/_/g, " ")}</Badge>
                </TableCell>
                <TableCell className="max-w-[180px] truncate text-sm" title={ret.reason}>{ret.reason}</TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(ret.createdAt).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell>
                  <ReturnStatusUpdater returnId={ret.id} currentStatus={ret.status} />
                </TableCell>
              </TableRow>
            ))}
            {returns.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No return requests yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
