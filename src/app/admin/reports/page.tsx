import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { PaymentStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const revalidate = 60;

export default async function ReportsPage() {
  await requirePermission("DASHBOARD", "VIEW");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const [
    totalRevenue,
    monthRevenue,
    weekRevenue,
    allOrders,
    allOrderItems,
    totalOrders,
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { status: PaymentStatus.CAPTURED }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: PaymentStatus.CAPTURED, createdAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: PaymentStatus.CAPTURED, createdAt: { gte: startOfWeek } }, _sum: { amount: true } }),
    // JS-side grouping avoids groupBy adapter incompatibility
    prisma.order.findMany({ select: { status: true } }),
    prisma.orderItem.findMany({ select: { sanityProductId: true, productNameSnap: true, quantity: true } }),
    prisma.order.count(),
  ]);

  // Group orders by status in JS
  const statusCountMap = new Map<string, number>();
  for (const order of allOrders) {
    statusCountMap.set(order.status, (statusCountMap.get(order.status) ?? 0) + 1);
  }
  const ordersByStatus = Array.from(statusCountMap.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  // Group order items by sanityProductId — one unique entry per product = no duplicate keys
  const productMap = new Map<string, { name: string; qty: number }>();
  for (const item of allOrderItems) {
    const key = item.sanityProductId ?? item.productNameSnap;
    const existing = productMap.get(key) ?? { name: item.productNameSnap, qty: 0 };
    existing.qty += item.quantity;
    productMap.set(key, existing);
  }
  const topProducts = Array.from(productMap.entries())
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 10);

  const fmt = (paise: number | null) => `₹${((paise || 0) / 100).toLocaleString("en-IN")}`;

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PACKED: "bg-indigo-100 text-indigo-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    RETURNED: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Revenue and sales performance overview.</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{fmt(totalRevenue._sum.amount)}</div>
            <p className="text-xs text-muted-foreground mt-1">From {totalOrders} total orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fmt(monthRevenue._sum.amount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Since {startOfMonth.toLocaleDateString("en-IN")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fmt(weekRevenue._sum.amount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Rolling 7-day window</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersByStatus.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[row.status] || "bg-gray-100"}`}>
                        {row.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{row.count}</TableCell>
                  </TableRow>
                ))}
                {ordersByStatus.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-4">No orders yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Products by Units Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map(([productId, data]) => (
                  <TableRow key={productId}>
                    <TableCell className="max-w-[220px] truncate font-medium">{data.name}</TableCell>
                    <TableCell className="text-right font-semibold">{data.qty}</TableCell>
                  </TableRow>
                ))}
                {topProducts.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-4">No sales data yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
