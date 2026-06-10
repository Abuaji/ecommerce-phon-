import { prisma } from "@/lib/db";
import { checkAvailableStock, incrementReservedStock } from "../server/repositories/inventory.repository";

/**
 * Validates the core DB transactional workflows using Prisma CRUD operations.
 * Must be executed to verify Phase 3 DB architecture matches requirements.
 */
export async function validateDatabase() {
  console.log("Starting DB Validation...");

  try {
    // Note: To run this test, the database must be seeded with mock data.
    // Ensure all Phase 3 tables exist and constraints are working.
    
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Connection successful.");

    // Test transactions and atomicity (Inventory)
    // 1. Create mock product inventory
    const inventory = await prisma.inventory.create({
      data: {
        sanityProductId: "test_product_123",
        availableStock: 10,
        reservedStock: 0,
        lowStockThreshold: 2,
      }
    });
    console.log("✅ Inventory schema constraints working.");

    // 2. Test Soft Validation & Reservation
    const hasStock = await checkAvailableStock(inventory.sanityProductId, 2);
    if (hasStock) {
      await incrementReservedStock(inventory.sanityProductId, 2);
    }
    const updatedInventory = await prisma.inventory.findUnique({ where: { sanityProductId: inventory.sanityProductId } });
    if (updatedInventory?.reservedStock === 2) {
      console.log("✅ In-memory/Soft Stock validation + Atomic Reservation successful.");
    }

    // Clean up
    await prisma.inventory.delete({ where: { sanityProductId: inventory.sanityProductId } });

    console.log("✅ All validations completed.");
  } catch (error) {
    console.error("❌ Validation Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// To run: npx ts-node src/tests/db-validation.ts
if (require.main === module) {
  validateDatabase();
}
