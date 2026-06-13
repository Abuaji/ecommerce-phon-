"use server";

import { writeClient } from "@/sanity/lib/client";
import { requirePermission } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function adminUpdateProductCategory(sanityProductId: string, newCategory: string) {
  // 1. RBAC Verification
  await requirePermission("PRODUCTS", "UPDATE");

  try {
    // 2. Patch Sanity Document
    await writeClient
      .patch(sanityProductId)
      .set({ category: newCategory })
      .commit();

    // 3. Audit Logging
    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any, // Reusing an existing enum value safely
        summary: `Admin updated category for product ${sanityProductId} to "${newCategory}"`,
        entityType: "Product",
        entityId: sanityProductId,
      },
    });

    // 4. Cache Revalidation
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error updating product category:", error);
    return { error: "Failed to update category" };
  }
}

export async function adminDeleteProduct(sanityProductId: string) {
  // 1. RBAC Verification
  await requirePermission("PRODUCTS", "DELETE");

  try {
    // 2. Delete Sanity Document
    await writeClient.delete(sanityProductId);

    // 3. Cleanup PostgreSQL Inventory safely without breaking architecture
    await prisma.inventory.deleteMany({
      where: { sanityProductId },
    });

    // 4. Audit Logging
    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any, // Reusing an existing enum value safely
        summary: `Admin deleted product ${sanityProductId}`,
        entityType: "Product",
        entityId: sanityProductId,
      },
    });

    // 5. Cache Revalidation
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Failed to delete product" };
  }
}
