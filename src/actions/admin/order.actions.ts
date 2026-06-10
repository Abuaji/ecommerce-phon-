"use server";

import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { OrderStatus, AuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function adminUpdateOrderStatus(orderId: string, newStatus: OrderStatus) {
  // 1. RBAC Verification
  await requirePermission("ORDERS", "UPDATE");

  // 2. Fetch current order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { error: "Order not found" };
  }

  // 3. State Machine Protection
  // Example valid transitions:
  // CONFIRMED -> PROCESSING
  // PROCESSING -> SHIPPED
  // SHIPPED -> OUT_FOR_DELIVERY
  // OUT_FOR_DELIVERY -> DELIVERED
  // Only CANCELLED can happen from PENDING/CONFIRMED if payment fails or user cancels
  const validTransitions: Record<string, string[]> = {
    PENDING: ["CANCELLED"],
    CONFIRMED: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["OUT_FOR_DELIVERY", "RETURNED"], // RETURNED is usually post-delivery, but tracking might skip
    OUT_FOR_DELIVERY: ["DELIVERED", "RETURNED"],
    DELIVERED: ["RETURNED"],
    CANCELLED: [],
    RETURNED: [],
  };

  if (!validTransitions[order.status].includes(newStatus)) {
    return { error: `Invalid status transition from ${order.status} to ${newStatus}` };
  }

  try {
    // 4. Update Database
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // 5. Audit Logging
    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: AuditAction.ORDER_STATUS_CHANGED,
        summary: `Admin updated order ${order.orderNumber} to ${newStatus}`,
        entityType: "Order",
        
      },
    });

    // 6. Cache Revalidation
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { error: "Failed to update order status" };
  }
}
