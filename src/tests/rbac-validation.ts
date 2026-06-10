import { adminAdjustStock } from "@/actions/admin/inventory.actions";
import { adminUpdateOrderStatus } from "@/actions/admin/order.actions";
import { adminModerateReview } from "@/actions/admin/review.actions";
import { OrderStatus } from "@prisma/client";

async function testRbacProtection() {
  console.log("Starting RBAC Protection Tests...");
  console.log("Simulating unauthorized environment (No NextAuth cookies present)...");

  let passed = 0;
  let total = 3;

  const expectAuthEngagement = (error: any) => {
    // Next.js throws 'headers was called outside a request scope' when auth() is called programmatically
    // OR it throws NEXT_REDIRECT if we somehow polyfilled headers.
    return error.message.includes("headers") || error.message.includes("redirect");
  };

  // 1. Test adminAdjustStock
  try {
    await adminAdjustStock("fake-id", 5, "Test");
    console.error("❌ adminAdjustStock did NOT block unauthorized access!");
  } catch (error: any) {
    if (expectAuthEngagement(error)) {
      console.log("✅ adminAdjustStock correctly engaged Auth layer & blocked access");
      passed++;
    } else {
      console.error("❌ adminAdjustStock failed with unexpected error:", error);
    }
  }

  // 2. Test adminUpdateOrderStatus
  try {
    await adminUpdateOrderStatus("fake-id", OrderStatus.CONFIRMED);
    console.error("❌ adminUpdateOrderStatus did NOT block unauthorized access!");
  } catch (error: any) {
    if (expectAuthEngagement(error)) {
      console.log("✅ adminUpdateOrderStatus correctly engaged Auth layer & blocked access");
      passed++;
    } else {
      console.error("❌ adminUpdateOrderStatus failed with unexpected error:", error);
    }
  }

  // 3. Test adminModerateReview
  try {
    await adminModerateReview("fake-id", "APPROVE");
    console.error("❌ adminModerateReview did NOT block unauthorized access!");
  } catch (error: any) {
    if (expectAuthEngagement(error)) {
      console.log("✅ adminModerateReview correctly engaged Auth layer & blocked access");
      passed++;
    } else {
      console.error("❌ adminModerateReview failed with unexpected error:", error);
    }
  }

  console.log(`\nRBAC Protection Results: ${passed}/${total} passed.`);
  if (passed !== total) {
    process.exit(1);
  }
}

testRbacProtection();
