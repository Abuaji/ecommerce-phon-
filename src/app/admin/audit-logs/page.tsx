import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { AuditAction } from "@prisma/client";
import { ScrollText } from "lucide-react";

export const revalidate = 0;

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "bg-blue-100 text-blue-800",
  LOGOUT: "bg-gray-100 text-gray-800",
  ORDER_STATUS_CHANGED: "bg-purple-100 text-purple-800",
  REFUND_ISSUED: "bg-red-100 text-red-800",
  STOCK_ADJUSTMENT: "bg-orange-100 text-orange-800",
  RETURN_APPROVED: "bg-green-100 text-green-800",
  RETURN_REJECTED: "bg-red-100 text-red-800",
  COUPON_CREATED: "bg-teal-100 text-teal-800",
  COUPON_UPDATED: "bg-teal-100 text-teal-800",
  ADMIN_CREATED: "bg-indigo-100 text-indigo-800",
  ROLE_CHANGED: "bg-indigo-100 text-indigo-800",
  SETTINGS_UPDATED: "bg-yellow-100 text-yellow-800",
  CATALOG_SYNCED: "bg-cyan-100 text-cyan-800",
  BULK_IMPORT: "bg-pink-100 text-pink-800",
};

export default async function AuditLogsPage() {
  await requirePermission("DASHBOARD", "VIEW");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { adminUser: { select: { fullName: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Complete activity trail — last 200 events.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">Date & Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("en-IN")}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${ACTION_COLORS[log.action] || "bg-muted text-muted-foreground"}`}>
                    {log.action.replace(/_/g, " ")}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{log.adminUser?.fullName || "System"}</div>
                  <div className="text-xs text-muted-foreground">{log.adminUser?.email || ""}</div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {log.entityType && <span className="font-mono">{log.entityType}</span>}
                  {log.entityId && <span className="block text-muted-foreground/50 truncate max-w-[100px]">{log.entityId}</span>}
                </TableCell>
                <TableCell className="max-w-[280px] truncate text-sm" title={log.summary}>{log.summary}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No activity logged yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
