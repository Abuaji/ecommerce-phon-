"use server";

import { writeClient, readClient } from "@/sanity/lib/client";
import { requirePermission } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

// ─────────────────────────────────────────────
// GET ALL CATEGORIES
// ─────────────────────────────────────────────
export async function adminGetAllCategories() {
  await requirePermission("PRODUCTS", "VIEW");

  const categories = await readClient.fetch(`
    *[_type == "category"] | order(displayOrder asc, name asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      isActive,
      isFeatured,
      displayOrder,
      level,
      "imageUrl": image.asset->url,
      "parentName": parent->name,
      "parentId": parent->_id,
      "productCount": count(*[_type == "product" && references(^._id)])
    }
  `);

  return categories as CategoryDoc[];
}

export type CategoryDoc = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  level: number;
  imageUrl?: string;
  parentName?: string;
  parentId?: string;
  productCount: number;
};

// ─────────────────────────────────────────────
// CREATE CATEGORY
// ─────────────────────────────────────────────
export async function adminCreateCategory(data: {
  name: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  parentId?: string;
}) {
  await requirePermission("PRODUCTS", "CREATE");

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    type SanityDoc = {
      _type: string;
      name: string;
      slug: { _type: string; current: string };
      description: string;
      isActive: boolean;
      isFeatured: boolean;
      displayOrder: number;
      level: number;
      parent?: { _type: string; _ref: string };
    };

    const doc: SanityDoc = {
      _type: "category",
      name: data.name,
      slug: { _type: "slug", current: slug },
      description: data.description || "",
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      displayOrder: data.displayOrder,
      level: data.parentId ? 2 : 1,
      ...(data.parentId && {
        parent: { _type: "reference", _ref: data.parentId },
      }),
    };

    const created = await writeClient.create(doc);

    // Audit log
    const session = await import("@/auth").then((m) => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin created category "${data.name}" (slug: ${slug})`,
        entityType: "Category",
        entityId: created._id,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true, id: created._id };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { error: error?.message || "Failed to create category" };
  }
}

// ─────────────────────────────────────────────
// UPDATE CATEGORY
// ─────────────────────────────────────────────
export async function adminUpdateCategory(
  categoryId: string,
  data: {
    name: string;
    description?: string;
    isActive: boolean;
    isFeatured: boolean;
    displayOrder: number;
    parentId?: string;
  }
) {
  await requirePermission("PRODUCTS", "UPDATE");

  try {
    const patch: Record<string, unknown> = {
      name: data.name,
      description: data.description || "",
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      displayOrder: data.displayOrder,
      level: data.parentId ? 2 : 1,
    };

    if (data.parentId) {
      patch.parent = { _type: "reference", _ref: data.parentId };
    }

    await writeClient.patch(categoryId).set(patch).commit();

    // Audit log
    const session = await import("@/auth").then((m) => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin updated category "${data.name}" (${categoryId})`,
        entityType: "Category",
        entityId: categoryId,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return { error: error?.message || "Failed to update category" };
  }
}

// ─────────────────────────────────────────────
// DELETE CATEGORY (with safety guard)
// ─────────────────────────────────────────────
export async function adminDeleteCategory(categoryId: string) {
  await requirePermission("PRODUCTS", "DELETE");

  try {
    // Safety guard: check if any products reference this category
    const productCount = await readClient.fetch(
      `count(*[_type == "product" && references($id)])`,
      { id: categoryId }
    );

    if (productCount > 0) {
      return {
        error: `Cannot delete — ${productCount} product(s) are assigned to this category. Reassign them first.`,
      };
    }

    await writeClient.delete(categoryId);

    // Audit log
    const session = await import("@/auth").then((m) => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin deleted category (${categoryId})`,
        entityType: "Category",
        entityId: categoryId,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { error: error?.message || "Failed to delete category" };
  }
}

// ─────────────────────────────────────────────
// BULK DELETE CATEGORIES
// ─────────────────────────────────────────────
export async function adminBulkDeleteCategories(categoryIds: string[]) {
  await requirePermission("PRODUCTS", "DELETE");

  const results = await Promise.all(
    categoryIds.map((id) => adminDeleteCategory(id))
  );

  const failures = results.filter((r) => r.error);
  const successes = results.filter((r) => (r as any).success);

  return {
    deletedCount: successes.length,
    failedCount: failures.length,
    errors: failures.map((f) => f.error),
  };
}
