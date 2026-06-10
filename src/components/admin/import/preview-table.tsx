import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PreviewTableProps {
  data: {
    willCreate: number;
    willUpdate: number;
    willFail: number;
    failures: { row: number; sku: string; reason: string }[];
  };
}

export function PreviewTable({ data }: PreviewTableProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 bg-green-50 text-green-900 border-green-200">
          <h4 className="text-sm font-semibold mb-1">Will Create</h4>
          <p className="text-3xl font-bold">{data.willCreate}</p>
        </div>
        <div className="rounded-lg border p-4 bg-blue-50 text-blue-900 border-blue-200">
          <h4 className="text-sm font-semibold mb-1">Will Update</h4>
          <p className="text-3xl font-bold">{data.willUpdate}</p>
        </div>
        <div className="rounded-lg border p-4 bg-red-50 text-red-900 border-red-200">
          <h4 className="text-sm font-semibold mb-1">Will Fail</h4>
          <p className="text-3xl font-bold">{data.willFail}</p>
        </div>
      </div>

      {data.failures.length > 0 && (
        <div className="rounded-lg border">
          <div className="p-4 border-b bg-muted/50">
            <h4 className="font-semibold text-sm">Failed Rows Details</h4>
            <p className="text-sm text-muted-foreground">These rows will be skipped during execution.</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Row</TableHead>
                <TableHead className="w-48">SKU</TableHead>
                <TableHead>Error Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.failures.map((f, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{f.row}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{f.sku}</Badge>
                  </TableCell>
                  <TableCell className="text-destructive">{f.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
