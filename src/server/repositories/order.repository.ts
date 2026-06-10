import { prisma } from "@/lib/db";
import { Prisma, OrderStatus,} from "@prisma/client";

/**
 * Creates a PENDING order with its items.
 */
export async function createOrder(data: Prisma.OrderCreateInput) {
  return prisma.order.create({
    data,
    include: {
      items: true,
    },
  });
}

/**
 * Updates order status. 
 * WARNING: Do not call directly from API handlers without passing through the service-layer state machine.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}

/**
 * Fetches an order by ID.
 */
export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payments: true,
      couponRedemption: true,
    },
  });
}
