import { prisma } from "@/lib/db";
import { createCheckoutSession } from "@/actions/checkout/checkout.actions";
import { POST } from "@/app/api/webhooks/razorpay/route";
import { NextRequest } from "next/server";

async function setupTestData() {
  const sanityProductId = "sanity-test-product-1";
  const couponCode = "TESTCOUPON100";

  // Cleanup
  await prisma.inventoryTransaction.deleteMany({ where: { inventory: { sanityProductId } } });
  await prisma.couponRedemption.deleteMany({ where: { coupon: { code: couponCode } } });
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.inventory.deleteMany({ where: { sanityProductId } });
  await prisma.coupon.deleteMany({ where: { code: couponCode } });

  // Create Inventory
  await prisma.inventory.create({
    data: {
      sanityProductId,
      availableStock: 50,
      reservedStock: 0,
    },
  });

  // Create Coupon
  await prisma.coupon.create({
    data: {
      code: couponCode,
      discountType: "FIXED",
      discountValue: 10000, // 100 INR
      isActive: true,
    },
  });

  return { sanityProductId, couponCode };
}

async function simulateWebhook(providerOrderId: string, providerPaymentId: string, event: string) {
  const payload = {
    event,
    payload: {
      payment: {
        entity: {
          id: providerPaymentId,
          order_id: providerOrderId,
          error_description: event === "payment.failed" ? "Insufficient funds" : null,
        },
      },
    },
  };

  const req = new NextRequest("http://localhost/api/webhooks/razorpay", {
    method: "POST",
    headers: {
      "x-razorpay-signature": "mock_signature_valid",
    },
    body: JSON.stringify(payload),
  });

  const res = await POST(req);
  return res.json();
}

async function main() {
  console.log("Starting Razorpay Integration Validation...");
  const { sanityProductId, couponCode } = await setupTestData();

  console.log("\n--- TEST 1: Successful Payment ---");
  // 1. Checkout
  const checkoutRes = await createCheckoutSession({
    customerEmail: "test@example.com",
    items: [{ sanityProductId, quantity: 2, unitPrice: 50000, productNameSnap: "Test Product" }],
    shippingAddress: { city: "Test" },
    couponCode,
  });

  if (checkoutRes.error || !checkoutRes.data) throw new Error(checkoutRes.error);
  console.log("✅ Checkout Session Created:", checkoutRes.data.razorpayOrderId);

  // Assert Reservation
  const inv1 = await prisma.inventory.findUnique({ where: { sanityProductId } });
  if (inv1?.reservedStock !== 2 || inv1?.availableStock !== 50) throw new Error("Inventory reservation failed");
  console.log("✅ Stock Reserved (Available: 50, Reserved: 2)");

  const cr1 = await prisma.couponRedemption.findFirst({ where: { orderId: checkoutRes.data.orderId } });
  if (cr1?.status !== "RESERVED") throw new Error("Coupon reservation failed");
  console.log("✅ Coupon Reserved");

  // 2. Webhook Captured
  const webhookRes = await simulateWebhook(checkoutRes.data.razorpayOrderId, "pay_capture_123", "payment.captured");
  if (webhookRes.error) throw new Error(webhookRes.error);

  // Assert Fulfillment
  const inv2 = await prisma.inventory.findUnique({ where: { sanityProductId } });
  if (inv2?.reservedStock !== 0 || inv2?.availableStock !== 48) throw new Error(`Stock fulfillment failed: ${JSON.stringify(inv2)}`);
  console.log("✅ Stock Fulfilled (Available: 48, Reserved: 0)");

  const cr2 = await prisma.couponRedemption.findFirst({ where: { orderId: checkoutRes.data.orderId } });
  if (cr2?.status !== "CONFIRMED") throw new Error("Coupon confirmation failed");
  console.log("✅ Coupon Confirmed");

  const order2 = await prisma.order.findUnique({ where: { id: checkoutRes.data.orderId } });
  if (order2?.status !== "CONFIRMED") throw new Error("Order confirmation failed");
  console.log("✅ Order Confirmed");


  console.log("\n--- TEST 2: Duplicate Webhook Idempotency ---");
  const webhookRes2 = await simulateWebhook(checkoutRes.data.razorpayOrderId, "pay_capture_123", "payment.captured");
  if (webhookRes2.status !== "already processed") throw new Error("Idempotency failed!");
  console.log("✅ Idempotency Verified (Duplicate blocked)");


  console.log("\n--- TEST 3: Failed Payment Rollback ---");
  const checkoutFailRes = await createCheckoutSession({
    customerEmail: "test@example.com",
    items: [{ sanityProductId, quantity: 5, unitPrice: 50000, productNameSnap: "Test Product 2" }],
    shippingAddress: { city: "Test" },
    couponCode,
  });
  if (checkoutFailRes.error || !checkoutFailRes.data) throw new Error(checkoutFailRes.error);
  
  const webhookResFail = await simulateWebhook(checkoutFailRes.data.razorpayOrderId, "pay_fail_123", "payment.failed");
  if (webhookResFail.error) throw new Error(webhookResFail.error);

  // Assert Rollback
  const inv3 = await prisma.inventory.findUnique({ where: { sanityProductId } });
  if (inv3?.reservedStock !== 0 || inv3?.availableStock !== 48) throw new Error("Stock rollback failed");
  console.log("✅ Stock Released (Available: 48, Reserved: 0)");

  const cr3 = await prisma.couponRedemption.findFirst({ where: { orderId: checkoutFailRes.data.orderId } });
  if (cr3?.status !== "ROLLED_BACK") throw new Error("Coupon rollback failed");
  console.log("✅ Coupon Rolled Back");

  const order3 = await prisma.order.findUnique({ where: { id: checkoutFailRes.data.orderId } });
  if (order3?.status !== "CANCELLED") throw new Error("Order cancellation failed");
  console.log("✅ Order Cancelled");


  console.log("\n--- TEST 4: Inventory Protection Floor Guard ---");
  const overSellRes = await createCheckoutSession({
    customerEmail: "test@example.com",
    items: [{ sanityProductId, quantity: 100, unitPrice: 50000, productNameSnap: "Oversell Product" }],
    shippingAddress: { city: "Test" },
  });
  if (!overSellRes.error?.includes("Insufficient stock")) throw new Error("Floor guard failed to block oversell");
  console.log("✅ Floor Guard Prevented Negative Stock");


  console.log("\n✅ ALL TESTS PASSED SUCCESSFULLY");
}

main()
  .catch((e) => {
    console.error("❌ Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
