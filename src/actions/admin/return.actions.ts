"use server";

import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import { ReturnStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function adminUpdateReturnStatus(returnId: string, newStatus: ReturnStatus, adminNotes?: string) {
  await requirePermission("ORDERS", "UPDATE");
  try {
    await prisma.return.update({
      where: { id: returnId },
      data: {
        status: newStatus,
        ...(adminNotes && { adminNotes }),
      },
    });
    revalidatePath("/admin/returns");
    return { success: true };
  } catch {
    return { error: "Failed to update return status" };
  }
}
