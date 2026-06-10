"use server";

import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { ReviewStatus, AuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function adminModerateReview(reviewId: string, action: "APPROVE" | "REJECT") {
  // 1. RBAC Verification
  await requirePermission("REVIEWS", "UPDATE");

  try {
    const status = action === "APPROVE" ? ReviewStatus.APPROVED : ReviewStatus.REJECTED;

    await prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });

    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "REVIEW_MODERATED" as any,
        summary: `Admin ${action.toLowerCase()}d review ${reviewId}`,
        entityType: "Review",
        
      },
    });

    // In a real implementation, if APPROVED, we would calculate the new average
    // and trigger a Sanity webhook or API call to update the cached rating on the Product document.
    // e.g. SanityClient.patch(sanityProductId).set({ rating: newAvg }).commit()

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error("Error moderating review:", error);
    return { error: "Failed to moderate review" };
  }
}
