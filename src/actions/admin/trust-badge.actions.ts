"use server";

import { writeClient, readClient } from "@/sanity/lib/client";
import { requirePermission } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

// ─── Read all trust badges (for admin list) ──────────────────────────────────
export async function adminGetTrustBadges() {
  await requirePermission("MARKETING", "VIEW");
  return readClient.fetch(`
    *[_type == "trustBadge"] | order(displayOrder asc) {
      _id,
      title,
      description,
      icon,
      isActive,
      displayOrder
    }
  `);
}

// ─── Create a new trust badge ─────────────────────────────────────────────────
export async function adminCreateTrustBadge(data: {
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}) {
  await requirePermission("MARKETING", "CREATE");

  try {
    await writeClient.create({
      _type: "trustBadge",
      ...data,
    });

    revalidatePath("/admin/trust-badges");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating trust badge:", error);
    return { error: "Failed to create trust badge" };
  }
}

// ─── Update an existing trust badge ──────────────────────────────────────────
export async function adminUpdateTrustBadge(
  id: string,
  data: {
    title?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
    displayOrder?: number;
  }
) {
  await requirePermission("MARKETING", "UPDATE");

  try {
    await writeClient.patch(id).set(data).commit();

    revalidatePath("/admin/trust-badges");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating trust badge:", error);
    return { error: "Failed to update trust badge" };
  }
}

// ─── Toggle active status ─────────────────────────────────────────────────────
export async function adminToggleTrustBadge(id: string, isActive: boolean) {
  await requirePermission("MARKETING", "UPDATE");

  try {
    await writeClient.patch(id).set({ isActive }).commit();

    revalidatePath("/admin/trust-badges");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error toggling trust badge:", error);
    return { error: "Failed to toggle trust badge" };
  }
}

// ─── Delete a trust badge ─────────────────────────────────────────────────────
export async function adminDeleteTrustBadge(id: string) {
  await requirePermission("MARKETING", "DELETE");

  try {
    await writeClient.delete(id);

    revalidatePath("/admin/trust-badges");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting trust badge:", error);
    return { error: "Failed to delete trust badge" };
  }
}

// ─── Reorder (bulk update displayOrder) ──────────────────────────────────────
export async function adminReorderTrustBadges(
  items: { id: string; displayOrder: number }[]
) {
  await requirePermission("MARKETING", "UPDATE");

  try {
    const transaction = writeClient.transaction();
    items.forEach(({ id, displayOrder }) => {
      transaction.patch(id, (p) => p.set({ displayOrder }));
    });
    await transaction.commit();

    revalidatePath("/admin/trust-badges");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error reordering trust badges:", error);
    return { error: "Failed to reorder trust badges" };
  }
}
