"use server";

import { writeClient, readClient } from "@/sanity/lib/client";
import { requirePermission } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function adminGetBanners() {
  await requirePermission("MARKETING", "VIEW");
  const banners = await readClient.fetch(`*[_type == "banner"] | order(displayOrder asc) {
    _id,
    internalName,
    title,
    heading,
    subheading,
    description,
    primaryButtonText,
    primaryButtonUrl,
    isActive,
    displayOrder,
    "desktopImageUrl": desktopImage.asset->url,
    "mobileImageUrl": mobileImage.asset->url
  }`);
  return banners || [];
}

export async function adminCreateBanner(formData: FormData) {
  await requirePermission("MARKETING", "CREATE");

  try {
    const internalName = formData.get("internalName") as string;
    const title = formData.get("title") as string;
    const heading = formData.get("heading") as string;
    const subheading = formData.get("subheading") as string;
    const description = formData.get("description") as string;
    const primaryButtonText = formData.get("primaryButtonText") as string;
    const primaryButtonUrl = formData.get("primaryButtonUrl") as string;
    const isActive = formData.get("isActive") === "true";
    const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;
    
    const desktopImageFile = formData.get("desktopImage") as File | null;
    const mobileImageFile = formData.get("mobileImage") as File | null;

    if (!internalName) return { error: "Internal Name is required" };
    if (!desktopImageFile || desktopImageFile.size === 0) return { error: "Desktop image is required" };
    if (!mobileImageFile || mobileImageFile.size === 0) return { error: "Mobile image is required" };

    const slugStr = internalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Upload desktop image
    const desktopBuffer = Buffer.from(await desktopImageFile.arrayBuffer());
    const desktopAsset = await writeClient.assets.upload('image', desktopBuffer, {
      filename: desktopImageFile.name,
      contentType: desktopImageFile.type,
    });

    // Upload mobile image
    const mobileBuffer = Buffer.from(await mobileImageFile.arrayBuffer());
    const mobileAsset = await writeClient.assets.upload('image', mobileBuffer, {
      filename: mobileImageFile.name,
      contentType: mobileImageFile.type,
    });

    const doc = {
      _type: "banner",
      internalName,
      slug: { _type: "slug", current: slugStr || "banner" },
      title,
      heading,
      subheading,
      description,
      primaryButtonText,
      primaryButtonUrl,
      isActive,
      displayOrder,
      desktopImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: desktopAsset._id }
      },
      mobileImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: mobileAsset._id }
      }
    };

    const created = await writeClient.create(doc);

    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any, // fallback enum
        summary: `Admin created banner ${internalName}`,
        entityType: "Banner",
        entityId: created._id,
      },
    });

    revalidatePath("/admin/marketing");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating banner:", error);
    return { error: error.message || "Failed to create banner" };
  }
}

export async function adminUpdateBanner(id: string, formData: FormData) {
  await requirePermission("MARKETING", "UPDATE");

  try {
    const internalName = formData.get("internalName") as string;
    const title = formData.get("title") as string;
    const heading = formData.get("heading") as string;
    const subheading = formData.get("subheading") as string;
    const description = formData.get("description") as string;
    const primaryButtonText = formData.get("primaryButtonText") as string;
    const primaryButtonUrl = formData.get("primaryButtonUrl") as string;
    const isActive = formData.get("isActive") === "true";
    const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;

    const desktopImageFile = formData.get("desktopImage") as File | null;
    const mobileImageFile = formData.get("mobileImage") as File | null;

    if (!internalName) return { error: "Internal Name is required" };

    const slugStr = internalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const patchData: any = {
      internalName,
      slug: { _type: "slug", current: slugStr || "banner" },
      title,
      heading,
      subheading,
      description,
      primaryButtonText,
      primaryButtonUrl,
      isActive,
      displayOrder,
    };

    if (desktopImageFile && desktopImageFile.size > 0) {
      const desktopBuffer = Buffer.from(await desktopImageFile.arrayBuffer());
      const desktopAsset = await writeClient.assets.upload('image', desktopBuffer, {
        filename: desktopImageFile.name,
        contentType: desktopImageFile.type,
      });
      patchData.desktopImage = {
        _type: 'image',
        asset: { _type: 'reference', _ref: desktopAsset._id }
      };
    }

    if (mobileImageFile && mobileImageFile.size > 0) {
      const mobileBuffer = Buffer.from(await mobileImageFile.arrayBuffer());
      const mobileAsset = await writeClient.assets.upload('image', mobileBuffer, {
        filename: mobileImageFile.name,
        contentType: mobileImageFile.type,
      });
      patchData.mobileImage = {
        _type: 'image',
        asset: { _type: 'reference', _ref: mobileAsset._id }
      };
    }

    await writeClient.patch(id).set(patchData).commit();

    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin updated banner ${internalName}`,
        entityType: "Banner",
        entityId: id,
      },
    });

    revalidatePath("/admin/marketing");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating banner:", error);
    return { error: error.message || "Failed to update banner" };
  }
}

export async function adminToggleBannerActive(id: string, isActive: boolean) {
  await requirePermission("MARKETING", "UPDATE");

  try {
    await writeClient.patch(id).set({ isActive }).commit();
    
    revalidatePath("/admin/marketing");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to toggle active status" };
  }
}

export async function adminDeleteBanner(id: string) {
  await requirePermission("MARKETING", "DELETE");

  try {
    await writeClient.delete(id);
    
    const session = await import("@/auth").then(m => m.auth());
    await prisma.auditLog.create({
      data: {
        adminUserId: session?.user?.id || null,
        action: "CATALOG_SYNCED" as any,
        summary: `Admin deleted banner ${id}`,
        entityType: "Banner",
        entityId: id,
      },
    });

    revalidatePath("/admin/marketing");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete banner" };
  }
}
