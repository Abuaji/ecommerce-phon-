import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReviewModerator } from "@/components/admin/review-moderator";
import { ReviewStatus } from "@prisma/client";

export default async function ReviewsPage() {
  await requirePermission("REVIEWS", "VIEW");

  // Fetch pending reviews
  const reviews = await prisma.review.findMany({
    where: { status: ReviewStatus.PENDING },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      orderItem: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Moderation</h1>
        <p className="text-muted-foreground">Approve or reject pending customer reviews.</p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.customer.name || review.customer.email}</TableCell>
                <TableCell className="max-w-[150px] truncate">{review.orderItem?.productNameSnap}</TableCell>
                <TableCell>{review.rating} / 5</TableCell>
                <TableCell className="max-w-[300px] truncate" title={review.comment || ""}>
                  {review.comment || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{review.status}</Badge>
                </TableCell>
                <TableCell>
                  <ReviewModerator reviewId={review.id} />
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No pending reviews.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
