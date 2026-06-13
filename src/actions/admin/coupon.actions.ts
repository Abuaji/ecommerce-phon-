"use server";

import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function adminGetCoupons() {
  await requirePermission("MARKETING", "VIEW");
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });
}

export async function adminCreateCoupon(data: {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate?: string;
}) {
  await requirePermission("MARKETING", "CREATE");

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue || null,
        maxDiscount: data.maxDiscount || null,
        usageLimit: data.usageLimit || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: true,
      },
    });
    revalidatePath("/admin/marketing");
    return { success: true, coupon };
  } catch (error: any) {
    if (error?.code === "P2002") return { error: "Coupon code already exists" };
    return { error: "Failed to create coupon" };
  }
}

export async function adminToggleCoupon(couponId: string, isActive: boolean) {
  await requirePermission("MARKETING", "UPDATE");
  try {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive },
    });
    revalidatePath("/admin/marketing");
    return { success: true };
  } catch {
    return { error: "Failed to update coupon" };
  }
}

export async function adminDeleteCoupon(couponId: string) {
  await requirePermission("MARKETING", "DELETE");
  try {
    await prisma.coupon.delete({ where: { id: couponId } });
    revalidatePath("/admin/marketing");
    return { success: true };
  } catch {
    return { error: "Cannot delete coupon — it may have active redemptions" };
  }
}
