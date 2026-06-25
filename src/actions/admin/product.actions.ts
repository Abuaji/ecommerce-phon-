"use server";

import { writeClient, readClient } from "@/sanity/lib/client";
import { requirePermission } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function adminQuickEditProduct(
  sanityProductId: string, 
  formData: FormData
) {
  await requirePermission("PRODUCTS", "UPDATE");

  try {
    const name = formData.get('name') as string;
    const price = Number(formData.get('price'));
    const category = formData.get('category') as string;
    const brand = formData.get('brand') as string;
    const imageFile = formData.get('image') as File | null;

    let categoryId = "";
    if (category && category.trim()) {
      const existingCategory = await readClient.fetch(
        `*[_type == "category" && lower(name) == lower($name)][0]`,
        { name: category.trim() }
      );
      if (existingCategory) {
        categoryId = existingCategory._id;
      } else {
        const slugStr = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const created = await writeClient.create({
          _type: "category",
          name: category.trim(),
          slug: { _type: "slug", current: slugStr || "unknown-category" },
          isActive: true,
        });
        categoryId = created._id;
      }
    }

    let brandId = "";
    if (brand && brand.trim()) {
      const existingBrand = await readClient.fetch(
        `*[_type == "brand" && lower(name) == lower($name)][0]`,
        { name: brand.trim() }
      );
      if (existingBrand) {
        brandId = existingBrand._id;
      } else {
        const slugStr = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const created = await writeClient.create({
          _type: "brand",
          name: brand.trim(),
          slug: { _type: "slug", current: slugStr || "unknown-brand" },
          isActive: true,
        });
        brandId = created._id;
      }
    }

    const patchData: any = {
      name: name,
      displayPrice: price,
    };

    if (categoryId) {
      patchData.category = { _type: "reference", _ref: categoryId };
    }
    if (brandId) {
      patchData.brand = { _type: "reference", _ref: brandId };
    }

    // Handle Image Upload if provided
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const asset = await writeClient.assets.upload('image', buffer, {
        filename: imageFile.name,
        contentType: imageFile.type,
      });
      patchData.mainImage = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      };
    }

    await writeClient
      .patch(sanityProductId)
      .set(patchData)
      .commit();

    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin quick edited product ${sanityProductId} (with image: ${!!imageFile})`,
        entityType: "Product",
        entityId: sanityProductId,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error quick editing product:", error);
    return { error: "Failed to update product details" };
  }
}

export async function adminUpdateProductCategory(sanityProductId: string, newCategory: string) {
  // 1. RBAC Verification
  await requirePermission("PRODUCTS", "UPDATE");

  try {
    // Lookup existing category
    const existingCategory = await readClient.fetch(
      `*[_type == "category" && lower(name) == lower($name)][0]`,
      { name: newCategory.trim() }
    );

    let categoryId = "";
    if (existingCategory) {
      categoryId = existingCategory._id;
    } else {
      // Create new category on the fly if it doesn't exist
      const slugStr = newCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const created = await writeClient.create({
        _type: "category",
        name: newCategory.trim(),
        slug: { _type: "slug", current: slugStr || "unknown-category" },
        isActive: true,
      });
      categoryId = created._id;
    }

    // 2. Patch Sanity Document with valid Reference
    await writeClient
      .patch(sanityProductId)
      .set({ 
        category: {
          _type: "reference",
          _ref: categoryId
        }
      })
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

export async function adminBulkUpdateCategory(productIds: string[], categoryName: string) {
  await requirePermission("PRODUCTS", "UPDATE");

  try {
    let categoryId = "";
    if (categoryName.trim()) {
      const existingCategory = await readClient.fetch(
        `*[_type == "category" && lower(name) == lower($name)][0]`,
        { name: categoryName.trim() }
      );
      if (existingCategory) {
        categoryId = existingCategory._id;
      } else {
        const slugStr = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const created = await writeClient.create({
          _type: "category",
          name: categoryName.trim(),
          slug: { _type: "slug", current: slugStr || "unknown-category" },
          isActive: true,
        });
        categoryId = created._id;
      }
    }

    if (!categoryId) return { error: "Category is required" };

    const transaction = writeClient.transaction();
    productIds.forEach((id) => {
      transaction.patch(id, (p) => p.set({ category: { _type: "reference", _ref: categoryId } }));
    });
    await transaction.commit();

    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin bulk updated category to ${categoryName} for ${productIds.length} products`,
        entityType: "Product",
        entityId: "BULK",
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error bulk updating category:", error);
    return { error: "Failed to bulk update category" };
  }
}

export async function adminBulkUpdateBrand(productIds: string[], brandName: string) {
  await requirePermission("PRODUCTS", "UPDATE");

  try {
    let brandId = "";
    if (brandName.trim()) {
      const existingBrand = await readClient.fetch(
        `*[_type == "brand" && lower(name) == lower($name)][0]`,
        { name: brandName.trim() }
      );
      if (existingBrand) {
        brandId = existingBrand._id;
      } else {
        const slugStr = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const created = await writeClient.create({
          _type: "brand",
          name: brandName.trim(),
          slug: { _type: "slug", current: slugStr || "unknown-brand" },
          isActive: true,
        });
        brandId = created._id;
      }
    }

    if (!brandId) return { error: "Brand is required" };

    const transaction = writeClient.transaction();
    productIds.forEach((id) => {
      transaction.patch(id, (p) => p.set({ brand: { _type: "reference", _ref: brandId } }));
    });
    await transaction.commit();

    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin bulk updated brand to ${brandName} for ${productIds.length} products`,
        entityType: "Product",
        entityId: "BULK",
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error bulk updating brand:", error);
    return { error: "Failed to bulk update brand" };
  }
}

export async function adminBulkDeleteProducts(productIds: string[]) {
  await requirePermission("PRODUCTS", "DELETE");

  try {
    const transaction = writeClient.transaction();
    productIds.forEach((id) => {
      transaction.delete(id);
    });
    await transaction.commit();

    await prisma.inventory.deleteMany({
      where: { sanityProductId: { in: productIds } },
    });

    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin bulk deleted ${productIds.length} products`,
        entityType: "Product",
        entityId: "BULK",
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    return { error: "Failed to bulk delete products" };
  }
}
