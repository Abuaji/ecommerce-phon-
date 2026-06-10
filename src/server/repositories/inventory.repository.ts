import { prisma } from "@/lib/db";
import { TxnReason } from "@prisma/client";

/**
 * Checks if available stock is sufficient without modifying it.
 */
export async function checkAvailableStock(sanityProductId: string, requiredQuantity: number) {
  const inventory = await prisma.inventory.findUnique({
    where: { sanityProductId },
    select: { availableStock: true, reservedStock: true }
  });
  
  if (!inventory) return false;
  return inventory.availableStock >= requiredQuantity;
}

/**
 * Atomically increments reservedStock. Called at PENDING order creation.
 */
export async function incrementReservedStock(sanityProductId: string, quantity: number) {
  return prisma.inventory.update({
    where: { sanityProductId },
    data: {
      reservedStock: {
        increment: quantity,
      },
    },
  });
}

/**
 * Atomically deducts availableStock, deducts reservedStock, and logs the transaction.
 * Called at CAPTURED webhook (Fulfillment).
 * Implements S5 Safety Rule: availableStock >= quantity guard is implicitly handled
 * if we use a raw query or Prisma where clause, but Prisma's update where doesn't 
 * natively support conditional updates on fields easily without a transaction.
 */
export async function fulfillReservedStock(
  sanityProductId: string, 
  quantity: number, 
  orderId: string
) {
  return prisma.$transaction(async (tx) => {
    // 1. Verify available stock first
    const inventory = await tx.inventory.findUnique({
      where: { sanityProductId },
    });

    if (!inventory || inventory.availableStock < quantity) {
      throw new Error(`Insufficient available stock for product ${sanityProductId}`);
    }

    // 2. Update stock
    const updated = await tx.inventory.update({
      where: { sanityProductId },
      data: {
        availableStock: { decrement: quantity },
        reservedStock: { decrement: quantity },
      },
    });

    // 3. Log transaction
    await tx.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        quantityChange: -quantity,
        reason: TxnReason.ORDER_FULFILLMENT,
        orderId,
      },
    });

    return updated;
  });
}

/**
 * Releases reservedStock back. Called on payment failure / timeout.
 */
export async function releaseReservedStock(sanityProductId: string, quantity: number, orderId?: string) {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.update({
      where: { sanityProductId },
      data: {
        reservedStock: { decrement: quantity },
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        quantityChange: 0, // reserved stock change doesn't technically change available physical stock, but we can log the event
        reason: TxnReason.RESERVATION_RELEASE,
        orderId: orderId || null,
      },
    });

    return inventory;
  });
}
