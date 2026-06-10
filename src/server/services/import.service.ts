import { prisma } from "@/lib/db";
import { writeClient } from "@/sanity/lib/client";
import { AssetService } from "./asset.service";
import { AuditRepository } from "../repositories/audit.repository";

export interface ImportRow {
  sku: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  mrp?: number;
  stock: number;
  description?: string;
  mainImage?: string;
  image2?: string;
  image3?: string;
  active: boolean;
}

export interface ImportPreviewResult {
  willCreate: number;
  willUpdate: number;
  willFail: number;
  failures: { row: number; sku: string; reason: string }[];
  validRows: ImportRow[];
}

export class ImportService {
  /**
   * Acquire a database lock to prevent concurrent imports.
   */
  static async acquireLock(userId: string): Promise<boolean> {
    const lock = await (prisma as any).importLock.findUnique({ where: { id: 1 } });
    if (lock?.isLocked) return false;

    await (prisma as any).importLock.upsert({
      where: { id: 1 },
      update: { isLocked: true, lockedBy: userId, lockedAt: new Date() },
      create: { id: 1, isLocked: true, lockedBy: userId, lockedAt: new Date() },
    });
    return true;
  }

  /**
   * Release the database lock.
   */
  static async releaseLock(): Promise<void> {
    await (prisma as any).importLock.update({
      where: { id: 1 },
      data: { isLocked: false, lockedBy: null, lockedAt: null },
    });
  }

  /**
   * Validates Excel rows against Sanity without making modifications.
   */
  static async processPreview(rows: ImportRow[]): Promise<ImportPreviewResult> {
    const result: ImportPreviewResult = {
      willCreate: 0,
      willUpdate: 0,
      willFail: 0,
      failures: [],
      validRows: [],
    };

    // Fetch active categories and brands for validation
    const categories = await writeClient.fetch(`*[_type == "category"]{name, _id}`);
    const brands = await writeClient.fetch(`*[_type == "brand"]{name, _id}`);
    const existingProducts = await writeClient.fetch(`*[_type == "product"]{sku, _id}`);

    const categoryMap = new Map(categories.map((c: any) => [c.name.toLowerCase(), c._id]));
    const brandMap = new Map(brands.map((b: any) => [b.name.toLowerCase(), b._id]));
    const skuMap = new Map(existingProducts.map((p: any) => [p.sku, p._id]));

    // Check for duplicate SKUs within the sheet itself
    const seenSkus = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;
      
      const rowNum = i + 2; // +1 for 0-index, +1 for header

      if (!row.sku || !row.name || row.price === undefined || row.stock === undefined) {
        result.willFail++;
        result.failures.push({ row: rowNum, sku: row.sku || "N/A", reason: "Missing required fields (SKU, Name, Price, or Stock)" });
        continue;
      }

      if (seenSkus.has(row.sku)) {
        result.willFail++;
        result.failures.push({ row: rowNum, sku: row.sku, reason: "Duplicate SKU found within the Excel file" });
        continue;
      }
      seenSkus.add(row.sku);

      if (row.category && !categoryMap.has(row.category.toLowerCase())) {
        result.willFail++;
        result.failures.push({ row: rowNum, sku: row.sku, reason: `Category '${row.category}' not found in Sanity` });
        continue;
      }

      if (row.brand && !brandMap.has(row.brand.toLowerCase())) {
        result.willFail++;
        result.failures.push({ row: rowNum, sku: row.sku, reason: `Brand '${row.brand}' not found in Sanity` });
        continue;
      }

      // If valid, determine if Create or Update
      if (skuMap.has(row.sku)) {
        result.willUpdate++;
      } else {
        result.willCreate++;
      }

      result.validRows.push(row);
    }

    return result;
  }

  /**
   * Executes the actual import batch. This modifies Sanity and Postgres.
   */
  static async executeImportBatch(
    validRows: ImportRow[],
    images: { filename: string; buffer: Buffer; mime: string }[],
    adminUserId: string,
    fileHash: string
  ) {
    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    const categories = await writeClient.fetch(`*[_type == "category"]{name, _id}`);
    const brands = await writeClient.fetch(`*[_type == "brand"]{name, _id}`);
    const existingProducts = await writeClient.fetch(`*[_type == "product"]{sku, _id}`);

    const categoryMap = new Map(categories.map((c: any) => [c.name.toLowerCase(), c._id]));
    const brandMap = new Map(brands.map((b: any) => [b.name.toLowerCase(), b._id]));
    const skuMap = new Map(existingProducts.map((p: any) => [p.sku, p._id]));

    // We process sequentially to avoid overwhelming Sanity API rate limits
    for (const row of validRows) {
      try {
        const isUpdate = skuMap.has(row.sku);
        const sanityProductId = isUpdate ? skuMap.get(row.sku) : undefined;

        // Resolve references
        const categoryId = row.category ? categoryMap.get(row.category.toLowerCase()) : undefined;
        const brandId = row.brand ? brandMap.get(row.brand.toLowerCase()) : undefined;

        // Base Sanity Document
        const sanityDoc: any = {
          _type: "product",
          sku: row.sku,
          name: row.name,
          displayPrice: row.price,
          isActive: row.active ?? true,
        };

        if (categoryId) sanityDoc.category = { _type: "reference", _ref: categoryId };
        if (brandId) sanityDoc.brand = { _type: "reference", _ref: brandId };
        if (row.mrp) sanityDoc.mrp = row.mrp;
        if (row.description) {
          sanityDoc.shortDescription = row.description.substring(0, 150);
          sanityDoc.description = [
            {
              _type: "block",
              children: [{ _type: "span", text: row.description }],
            },
          ];
        }

        // Image Handling
        const uploadImage = async (filename?: string) => {
          if (!filename) return undefined;
          const imageObj = images.find((img) => img.filename === filename.toLowerCase().trim());
          if (!imageObj) return undefined; // Image not in ZIP
          const assetId = await AssetService.uploadImageToSanity(imageObj.buffer, imageObj.filename);
          return { _type: "image", asset: { _ref: assetId } };
        };

        const mainImage = await uploadImage(row.mainImage);
        const image2 = await uploadImage(row.image2);
        const image3 = await uploadImage(row.image3);

        if (mainImage) sanityDoc.mainImage = mainImage;
        
        const gallery = [];
        if (image2) gallery.push(image2);
        if (image3) gallery.push(image3);
        
        if (gallery.length > 0) {
          sanityDoc.gallery = gallery;
        }

        let finalSanityId = sanityProductId;

        // Execute Sanity Mutate
        if (isUpdate && sanityProductId) {
          // Note: for updates, we patch only the provided fields. 
          // Undefined fields won't overwrite existing data in Sanity using standard set.
          await writeClient.patch(sanityProductId as string).set(sanityDoc).commit();
          updatedCount++;
        } else {
          sanityDoc.slug = { _type: "slug", current: row.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-") };
          if (!sanityDoc.mainImage) {
            throw new Error("New products must have a main image.");
          }
          const created = await writeClient.create(sanityDoc);
          finalSanityId = created._id;
          createdCount++;
        }

        // Execute Postgres Inventory Upsert
        try {
          await prisma.inventory.upsert({
            where: { sanityProductId: finalSanityId as string },
            update: { availableStock: row.stock },
            create: { sanityProductId: finalSanityId as string, availableStock: row.stock },
          });
        } catch (dbError: any) {
          // Scenario A: Sanity succeeded, Neon failed.
          // Push to retry queue
          await (prisma as any).inventoryRetryQueue.upsert({
            where: { sanityProductId: finalSanityId as string },
            update: { pendingStock: row.stock },
            create: { sanityProductId: finalSanityId as string, pendingStock: row.stock },
          });
          console.error(`Pushed ${row.sku} to InventoryRetryQueue due to DB error.`, dbError);
        }

      } catch (err: any) {
        failedCount++;
        errors.push({ sku: row.sku, reason: err.message || "Unknown execution error" });
      }
    }

    // Generate Audit Log
    await AuditRepository.createLog({
      adminUserId,
      action: "BULK_IMPORT" as any,
      summary: `Bulk imported ${validRows.length} products (Created: ${createdCount}, Updated: ${updatedCount}, Failed: ${failedCount})`,
      details: {
        fileHash,
        createdCount,
        updatedCount,
        failedCount,
        errors,
      },
    });

    return { createdCount, updatedCount, failedCount, errors };
  }
}

