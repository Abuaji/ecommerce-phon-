import { prisma } from "@/lib/db";
import { CouponRedemptionStatus } from "@prisma/client";

/**
 * Creates a RESERVED coupon redemption at PENDING order creation.
 */
export async function reserveCoupon(couponId: string, customerId: string, orderId: string, discountApplied: number) {
  // Sets reservedUntil to NOW() + 30 mins
  const reservedUntil = new Date(Date.now() + 30 * 60 * 1000);
  
  return prisma.couponRedemption.create({
    data: {
      couponId,
      customerId,
      orderId,
      discountApplied,
      status: CouponRedemptionStatus.RESERVED,
      reservedUntil,
    },
  });
}

/**
 * Transitions CouponRedemption to CONFIRMED. Called at CAPTURED webhook.
 */
export async function confirmCouponRedemption(orderId: string) {
  return prisma.couponRedemption.update({
    where: { orderId },
    data: {
      status: CouponRedemptionStatus.CONFIRMED,
      reservedUntil: null, // Clear expiry
    },
  });
}

/**
 * Rolls back a RESERVED coupon. Called on payment failure.
 */
export async function rollbackCouponRedemption(orderId: string) {
  return prisma.couponRedemption.update({
    where: { orderId },
    data: {
      status: CouponRedemptionStatus.ROLLED_BACK,
      reservedUntil: null,
    },
  });
}

/**
 * Fetch coupon details by code.
 */
export async function getCouponByCode(code: string) {
  return prisma.coupon.findUnique({
    where: { code },
  });
}
