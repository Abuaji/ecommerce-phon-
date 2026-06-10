import { NextResponse } from "next/server";
import { readClient } from "@/sanity/lib/client";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    const categories = await readClient.fetch(`*[_type == "category" && isActive == true]{name}`);
    const brands = await readClient.fetch(`*[_type == "brand" && isActive == true]{name}`);

    const categoryNames = categories.map((c: any) => c.name);
    const brandNames = brands.map((b: any) => b.name);

    const workbook = new ExcelJS.Workbook();
    
    // Main Products Sheet
    const sheet = workbook.addWorksheet("Products");
    sheet.columns = [
      { header: "SKU", key: "sku", width: 20 },
      { header: "Product Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 20 },
      { header: "Brand", key: "brand", width: 20 },
      { header: "Price", key: "price", width: 15 },
      { header: "MRP", key: "mrp", width: 15 },
      { header: "Stock", key: "stock", width: 15 },
      { header: "Description", key: "description", width: 40 },
      { header: "Main Image", key: "mainImage", width: 25 },
      { header: "Image 2", key: "image2", width: 25 },
      { header: "Image 3", key: "image3", width: 25 },
      { header: "Active", key: "active", width: 10 },
    ];

    // Style the header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Hidden Lookup Sheet for Dropdowns
    const lookupSheet = workbook.addWorksheet("Lookups", { state: "hidden" });
    
    // Fill Categories in Column A of Lookup
    lookupSheet.getCell("A1").value = "Categories";
    categoryNames.forEach((name: string, index: number) => {
      lookupSheet.getCell(`A${index + 2}`).value = name;
    });

    // Fill Brands in Column B of Lookup
    lookupSheet.getCell("B1").value = "Brands";
    brandNames.forEach((name: string, index: number) => {
      lookupSheet.getCell(`B${index + 2}`).value = name;
    });

    // Apply Data Validation to Main Sheet (Rows 2 to 1000)
    for (let i = 2; i <= 1000; i++) {
      // Category Dropdown (Column C)
      if (categoryNames.length > 0) {
        sheet.getCell(`C${i}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`Lookups!$A$2:$A$${categoryNames.length + 1}`],
        };
      }

      // Brand Dropdown (Column D)
      if (brandNames.length > 0) {
        sheet.getCell(`D${i}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`Lookups!$B$2:$B$${brandNames.length + 1}`],
        };
      }

      // Active Dropdown (Column L)
      sheet.getCell(`L${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"TRUE,FALSE"'],
      };
    }

    // Add a sample row to guide the user
    sheet.addRow({
      sku: "EXAMPLE-SKU-001",
      name: "Sample Wireless Charger",
      category: categoryNames[0] || "",
      brand: brandNames[0] || "",
      price: 1999,
      mrp: 2499,
      stock: 50,
      description: "A fast charging wireless pad.",
      mainImage: "charger.jpg",
      active: "TRUE",
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="products_template.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Failed to generate template:", error);
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 });
  }
}
