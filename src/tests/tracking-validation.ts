import { trackOrder } from "@/actions/tracking/tracking.actions";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

async function testTrackingSecurity() {
  console.log("Starting Tracking Security & Verification Tests...");

  let passed = 0;
  let total = 2;

  // 1. Create a dummy order to test against
  const dummyCustomer = await prisma.customer.create({
    data: { email: "tracking-test@example.com", isGuest: true }
  });

  const dummyOrder = await prisma.order.create({
    data: {
      orderNumber: "ORD-SEC-001",
      customerId: dummyCustomer.id,
      customerEmailSnap: "tracking-test@example.com",
      status: OrderStatus.PENDING,
      subtotal: 1000,
      grandTotal: 1000,
      shippingAddressSnap: {},
      billingAddressSnap: {}
    }
  });

  // Test 1: Enumeration Attempt (Valid Order ID, Wrong Email)
  console.log("\n[Test 1] Enumeration Attempt: Valid Order ID + Wrong Email");
  const enumerationResult = await trackOrder("ORD-SEC-001", "hacker@example.com");
  
  if (enumerationResult.error && enumerationResult.error.includes("Order not found")) {
    console.log("✅ Security Passed: Enumeration attempt blocked with generic message.");
    passed++;
  } else {
    console.error("❌ Security Failed: Enumeration attempt leaked data or threw unexpected error.", enumerationResult);
  }

  // Test 2: Valid Lookup
  console.log("\n[Test 2] Valid Lookup: Valid Order ID + Correct Email");
  const validResult = await trackOrder("ORD-SEC-001", "tracking-test@example.com");

  if (validResult.success && validResult.data?.orderNumber === "ORD-SEC-001") {
    console.log("✅ Lookup Passed: Correct composite keys yielded order data.");
    passed++;
  } else {
    console.error("❌ Lookup Failed: Valid keys were rejected.", validResult);
  }

  // Cleanup
  await prisma.order.delete({ where: { id: dummyOrder.id } });
  await prisma.customer.delete({ where: { id: dummyCustomer.id } });

  console.log(`\nTracking Verification Results: ${passed}/${total} passed.`);
  if (passed !== total) process.exit(1);
}

testTrackingSecurity();
