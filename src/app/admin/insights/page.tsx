import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

export const revalidate = 300; // Cache for 5 minutes

async function getDailyOrders(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, grandTotal: true },
  });

  const map: Record<string, { count: number; revenue: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = { count: 0, revenue: 0 };
  }
  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    if (map[key]) {
      map[key].count++;
      map[key].revenue += order.grandTotal;
    }
  }
  return Object.entries(map).map(([date, v]) => ({ date, ...v }));
}

async function getNewCustomersPerWeek() {
  const since = new Date();
  since.setDate(since.getDate() - 28);
  const customers = await prisma.customer.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const weeks: Record<string, number> = { "Week 1": 0, "Week 2": 0, "Week 3": 0, "Week 4": 0 };
  const now = Date.now();
  for (const c of customers) {
    const daysAgo = Math.floor((now - c.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) weeks["Week 4"]!++;
    else if (daysAgo < 14) weeks["Week 3"]!++;
    else if (daysAgo < 21) weeks["Week 2"]!++;
    else weeks["Week 1"]!++;
  }
  return Object.entries(weeks).map(([week, count]) => ({ week, count }));
}

async function getRevenueByPaymentMethod() {
  const payments = await prisma.payment.findMany({
    select: { provider: true, amount: true },
  });

  const grouped = new Map<string, { amount: number; count: number }>();
  for (const p of payments) {
    const existing = grouped.get(p.provider) ?? { amount: 0, count: 0 };
    existing.amount += p.amount;
    existing.count += 1;
    grouped.set(p.provider, existing);
  }

  return Array.from(grouped.entries()).map(([provider, data]) => ({
    provider,
    _sum: { amount: data.amount },
    _count: { id: data.count },
  }));
}

function MiniBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
        <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right">{value}</span>
    </div>
  );
}

export default async function InsightsPage() {
  await requirePermission("DASHBOARD", "VIEW");

  const [dailyOrders, weeklyCustomers, paymentMethods] = await Promise.all([
    getDailyOrders(14),
    getNewCustomersPerWeek(),
    getRevenueByPaymentMethod(),
  ]);

  const maxOrders = Math.max(...dailyOrders.map((d) => d.count), 1);
  const maxCustomers = Math.max(...weeklyCustomers.map((w) => w.count), 1);

  const totalRevenue = paymentMethods.reduce((acc, p) => acc + (p._sum.amount || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BarChart2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">Trend data for the last 14–28 days.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Orders per day */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Daily Orders — Last 14 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0.5">
              {dailyOrders.map((d) => (
                <MiniBar
                  key={d.date}
                  label={new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  value={d.count}
                  max={maxOrders}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New Customers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Customers — Last 4 Weeks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0.5">
              {weeklyCustomers.map((w) => (
                <MiniBar key={w.week} label={w.week} value={w.count} max={maxCustomers} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Payment Method */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Revenue by Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {paymentMethods.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No payment data available yet.</p>
            )}
            {paymentMethods.map((p) => (
              <div key={p.provider} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{p.provider}</p>
                  <p className="text-xs text-muted-foreground">{p._count.id} transaction{p._count.id !== 1 ? "s" : ""}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{((p._sum.amount || 0) / 100).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalRevenue > 0 ? Math.round(((p._sum.amount || 0) / totalRevenue) * 100) : 0}% of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
