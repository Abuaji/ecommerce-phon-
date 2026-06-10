"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function trackOrder(orderNumber: string, emailOrPhone: string) {
  if (!orderNumber || !emailOrPhone) {
    return { error: "Both Order Number and Email/Phone are required." };
  }

  try {
    // SECURITY: Composite Key Lookup. We MUST filter by BOTH the order number
    // AND the contact detail (email or phone) to prevent brute-force enumeration.
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber,
        OR: [
          { customerEmailSnap: emailOrPhone },
          { customerPhoneSnap: emailOrPhone }
        ]
      },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!order) {
      // SECURITY: Return a generic generic "not found" message. Do not reveal if the order number exists but email is wrong.
      return { error: "Order not found. Please verify your Order Number and Email/Phone." };
    }

    // Fetch the status history timeline from AuditLogs
    const statusHistory = await prisma.auditLog.findMany({
      where: {
        entityType: "Order",
        entityId: order.id,
        action: "ORDER_STATUS_CHANGED"
      },
      orderBy: { createdAt: 'asc' }
    });

    return { success: true, data: { ...order, statusHistory } };
  } catch (error) {
    console.error("Order tracking error:", error);
    return { error: "An unexpected error occurred while fetching your order." };
  }
}

export async function trackAuthenticatedOrder(orderId: string) {
  // 1. Session Check
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // 2. Fetch Customer ID tied to User
  // Assuming a user profile links to a customer record. If not, map email.
  const customer = await prisma.customer.findFirst({
    where: { email: session.user.email! }
  });

  if (!customer) return { error: "Customer profile not found" };

  try {
    // SECURITY: Ensure the order actually belongs to this customer
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: customer.id
      },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!order) {
      return { error: "Order not found or access denied." };
    }

    const statusHistory = await prisma.auditLog.findMany({
      where: {
        entityType: "Order",
        entityId: order.id,
        action: "ORDER_STATUS_CHANGED"
      },
      orderBy: { createdAt: 'asc' }
    });

    return { success: true, data: { ...order, statusHistory } };
  } catch (error) {
    console.error("Order tracking error:", error);
    return { error: "An unexpected error occurred." };
  }
}
