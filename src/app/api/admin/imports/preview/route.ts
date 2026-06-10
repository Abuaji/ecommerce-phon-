import { NextResponse } from "next/server";
import { ImportService, ImportRow } from "@/server/services/import.service";
import ExcelJS from "exceljs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const excelFile = formData.get("excel") as File;

    if (!excelFile) {
      return NextResponse.json({ error: "Missing Excel file" }, { status: 400 });
    }

    const arrayBuffer = await excelFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.getWorksheet("Products");
    if (!sheet) {
      return NextResponse.json({ error: "Invalid Excel file. 'Products' sheet not found." }, { status: 400 });
    }

    const rows: ImportRow[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      // Helper to safely get string values
      const getVal = (col: number) => {
        const val = row.getCell(col).value;
        return val ? val.toString().trim() : "";
      };

      // Helper to safely get number values
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

    // Run business logic pre-flight checks
    const previewResult = await ImportService.processPreview(rows);

    return NextResponse.json(previewResult);
  } catch (error: any) {
    console.error("Preview failed:", error);
    return NextResponse.json({ error: error.message || "Failed to process preview" }, { status: 500 });
  }
}
