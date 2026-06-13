import { AuditRepository } from "@/server/repositories/audit.repository";
import { AuditAction } from "@prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ImportHistoryPage() {
  const result = await AuditRepository.getLogs({
    action: AuditAction.BULK_IMPORT,
    limit: 100,
  });

  const getStatusIcon = (failedCount: number, updatedCount: number, createdCount: number) => {
    if (failedCount === 0 && (updatedCount > 0 || createdCount > 0)) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (failedCount > 0 && (updatedCount > 0 || createdCount > 0)) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import History</h1>
        <p className="text-muted-foreground mt-1">Audit log of all bulk product imports.</p>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead className="text-right">Updated</TableHead>
              <TableHead className="text-right">Failed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No imports have been run yet.
                </TableCell>
              </TableRow>
            ) : (
              result.logs.map((log) => {
                const details: any = log.details || {};
                const created = details.createdCount || 0;
                const updated = details.updatedCount || 0;
                const failed = details.failedCount || 0;

                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      {getStatusIcon(failed, updated, created)}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {log.adminUser?.fullName || "System Admin"}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {log.summary}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {created > 0 ? `+${created}` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-600">
                      {updated > 0 ? `~${updated}` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {failed > 0 ? `${failed}` : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
