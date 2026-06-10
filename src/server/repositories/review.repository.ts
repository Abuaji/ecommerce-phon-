import { prisma } from "@/lib/db";
import { Prisma, ReviewStatus,} from "@prisma/client";

export async function createReview(data: Prisma.ReviewCreateInput) {
  return prisma.review.create({
    data,
  });
}

export async function updateReviewStatus(reviewId: string, status: ReviewStatus) {
  return prisma.review.update({
    where: { id: reviewId },
    data: { status },
  });
}

export async function getReviewByOrderItem(customerId: string, orderItemId: string) {
  return prisma.review.findUnique({
    where: {
      customerId_orderItemId: {
        customerId,
        orderItemId,
      },
    },
  });
}

export async function updateProductRatingCache(sanityProductId: string, newAverage: number, reviewCount: number) {
  return prisma.productRating.upsert({
    where: { sanityProductId },
    update: {
      averageRating: newAverage,
      reviewCount,
    },
    create: {
      sanityProductId,
      averageRating: newAverage,
      reviewCount,
    },
  });
}
