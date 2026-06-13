"use server";

import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { TxnReason } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function adminAdjustStock(inventoryId: string, quantityChange: number, _reason: string) {
  // 1. RBAC Verification
  await requirePermission("INVENTORY", "UPDATE");

  if (quantityChange === 0) {
    return { error: "Quantity change must not be 0" };
  }

  try {
    // 2. Perform Adjustments inside Transaction to ensure Transaction Log is always written
    await prisma.$transaction(async (tx) => {
      const current = await tx.inventory.findUnique({ where: { id: inventoryId } });
      if (!current) throw new Error("Inventory record not found");

      if (current.availableStock + quantityChange < 0) {
        throw new Error("Cannot reduce stock below 0");
      }

      await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          availableStock: {
            increment: quantityChange,
          },
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          inventoryId,
          quantityChange,
          reason: TxnReason.MANUAL_ADJUSTMENT,
          
          // Could also attach 'reason' text to a details JSON or notes field if schema supported it.
        },
      });
    });

    // 3. Cache Revalidation
    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error: any) {
    console.error("Error adjusting inventory:", error);
    return { error: error.message || "Failed to adjust inventory" };
  }
}
