import { NextResponse } from "next/server";
import { ImportService, ImportRow } from "@/server/services/import.service";
import { AssetService } from "@/server/services/asset.service";
import ExcelJS from "exceljs";
import { auth } from "@/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminUserId = session.user.id;

    // Attempt to acquire lock
    const hasLock = await ImportService.acquireLock(adminUserId);
    if (!hasLock) {
      return NextResponse.json({ error: "Another import is already in progress. Please try again later." }, { status: 409 });
    }

    try {
      const formData = await req.formData();
      const excelFile = formData.get("excel") as File;
      const zipFile = formData.get("zip") as File;

      if (!excelFile) {
        throw new Error("Missing Excel file");
      }

      const excelArrayBuffer = await excelFile.arrayBuffer();
      const excelBuffer = Buffer.from(excelArrayBuffer) as unknown as Buffer;

      // Generate File Hash for idempotency checks
      const fileHash = crypto.createHash("sha256").update(excelBuffer).digest("hex");

      // Parse Excel or CSV
      const workbook = new ExcelJS.Workbook();
      let sheet: ExcelJS.Worksheet | undefined;

      if (excelFile.name.toLowerCase().endsWith('.csv')) {
        // Read CSV from buffer string
        const csvString = excelBuffer.toString('utf-8');
        sheet = await workbook.csv.read(require('stream').Readable.from([csvString]));
      } else {
        // @ts-ignore - ExcelJS types expect an older Buffer interface
        await workbook.xlsx.load(excelBuffer);
        sheet = workbook.getWorksheet("Products");
      }

      if (!sheet) {
        throw new Error("Invalid file. Ensure the file contains a valid sheet or is a proper CSV.");
      }

      const rows: ImportRow[] = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const getVal = (col: number) => {
          const val = row.getCell(col).value;
          return val ? val.toString().trim() : "";
        };
        const getNum = (col: number) => {
          const val = row.getCell(col).value;
          if (typeof val === "number") return val;
          if (typeof val === "string") return parseFloat(val);
          return undefined;
        };
        rows.push({
          sku: getVal(1),
          name: getVal(2),
          category: getVal(3),
          brand: getVal(4),
          price: getNum(5) || 0,
          mrp: getNum(6),
          stock: getNum(7) || 0,
          description: getVal(8),
          mainImage: getVal(9),
          image2: getVal(10),
          image3: getVal(11),
          active: getVal(12).toLowerCase() !== "false",
        });
      });

      // Run Preview again to get validated rows
      const previewResult = await ImportService.processPreview(rows);
      if (previewResult.validRows.length === 0) {
        throw new Error("No valid rows found to process.");
      }

      // Process ZIP Images if provided
      let extractedImages: any[] = [];
      if (zipFile) {
        const zipArrayBuffer = await zipFile.arrayBuffer();
        const zipBuffer = Buffer.from(zipArrayBuffer) as unknown as Buffer;
        extractedImages = await AssetService.extractImagesFromZip(zipBuffer);
      }

      // Execute Batch
      const result = await ImportService.executeImportBatch(
        previewResult.validRows,
        extractedImages,
        adminUserId,
        fileHash
      );

      // We merge the pre-flight failures with execution failures for the final report
      const responsePayload = {
        ...result,
        failures: [
          ...previewResult.failures,
          ...result.errors.map(e => ({ row: -1, sku: e.sku, reason: e.reason }))
        ]
      };

      return NextResponse.json(responsePayload);
    } finally {
      // Always release lock
      await ImportService.releaseLock();
    }
  } catch (error: any) {
    console.error("Execution failed:", error);
    // Best effort lock release in case of catastrophic outer failure
    await ImportService.releaseLock().catch(() => {});
    return NextResponse.json({ error: error.message || "Failed to execute import" }, { status: 500 });
  }
}
