"use server";

import { writeClient, readClient } from "@/sanity/lib/client";
import { requirePermission } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function adminQuickEditBrand(brandId: string, formData: FormData) {
  await requirePermission("PRODUCTS", "UPDATE");

  try {
    const name = formData.get('name') as string;
    const slugStr = formData.get('slug') as string;
    const isActive = formData.get('isActive') === 'true';
    const imageFile = formData.get('image') as File | null;

    const patchData: any = {
      name: name,
      slug: { _type: "slug", current: slugStr || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') },
      isActive: isActive,
    };

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const asset = await writeClient.assets.upload('image', buffer, {
        filename: imageFile.name,
        contentType: imageFile.type,
      });
      patchData.logo = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      };
    }

    await writeClient
      .patch(brandId)
      .set(patchData)
      .commit();

    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin quick edited brand ${brandId}`,
        entityType: "Brand",
        entityId: brandId,
      },
    });

    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Error quick editing brand:", error);
    return { error: "Failed to update brand details" };
  }
}

export async function adminDeleteBrand(brandId: string) {
  await requirePermission("PRODUCTS", "DELETE");

  try {
    // Check if brand has products
    const productsUsingBrand = await readClient.fetch(`count(*[_type == "product" && references($brandId)])`, { brandId });
    if (productsUsingBrand > 0) {
      return { error: `Cannot delete brand. It is used by ${productsUsingBrand} products.` };
    }

    await writeClient.delete(brandId);

    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin deleted brand ${brandId}`,
        entityType: "Brand",
        entityId: brandId,
      },
    });

    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return { error: "Failed to delete brand" };
  }
}

export async function adminBulkUpdateBrandStatus(brandIds: string[], isActive: boolean) {
  await requirePermission("PRODUCTS", "UPDATE");

  try {
    const transaction = writeClient.transaction();
    brandIds.forEach((id) => {
      transaction.patch(id, (p) => p.set({ isActive }));
    });
    await transaction.commit();

    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin bulk updated status to ${isActive} for ${brandIds.length} brands`,
        entityType: "Brand",
        entityId: "BULK",
      },
    });

    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Error bulk updating brand status:", error);
    return { error: "Failed to bulk update status" };
  }
}

export async function adminBulkDeleteBrands(brandIds: string[]) {
  await requirePermission("PRODUCTS", "DELETE");

  try {
    // We ideally should check references before bulk delete, but Sanity will block deletion
    // if there are strong references anyway, throwing an error.
    const transaction = writeClient.transaction();
    brandIds.forEach((id) => {
      transaction.delete(id);
    });
    
    // Catch specific Sanity reference errors
    try {
      await transaction.commit();
    } catch (txError: any) {
      if (txError.message?.includes('reference')) {
        return { error: "One or more selected brands cannot be deleted because they are attached to products." };
      }
      throw txError;
    }

    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin bulk deleted ${brandIds.length} brands`,
        entityType: "Brand",
        entityId: "BULK",
      },
    });

    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting brands:", error);
    return { error: "Failed to bulk delete brands. Check if they are used by products." };
  }
}
