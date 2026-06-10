import { EmailService } from "@/server/services/email.service";
import { prisma } from "@/lib/db";
import { EmailStatus } from "@prisma/client";

async function testEmailSystem() {
  console.log("Starting Email System Validation Tests...");
  let passed = 0;
  let total = 3;

  const MOCK_ORDER_ID = "mock-order-" + Date.now();
  const MOCK_EMAIL = "test-customer@example.com";

  // Test 1: Valid Flow (Mock environment variable)
  console.log("\n[Test 1] Standard Dispatch (Dev Mock)");
  const result1 = await EmailService.sendOrderConfirmation(MOCK_ORDER_ID, "ORD-TEST-123", MOCK_EMAIL, 150000);
  
  const log1 = await prisma.emailLog.findUnique({
    where: { idempotencyKey: `ORDER_CONF_v1_${MOCK_ORDER_ID}` }
  });

  if (result1.success && log1?.status === EmailStatus.SENT) {
    console.log("✅ Dispatch Passed: Mock email successfully routed and logged as SENT.");
    passed++;
  } else {
    console.error("❌ Dispatch Failed:", result1, log1);
  }

  // Test 2: Idempotency Verification
  console.log("\n[Test 2] Idempotency Verification (Duplicate Trigger)");
  const result2 = await EmailService.sendOrderConfirmation(MOCK_ORDER_ID, "ORD-TEST-123", MOCK_EMAIL, 150000);
  
  if (result2.skipped) {
    console.log("✅ Idempotency Passed: Duplicate event was blocked correctly.");
    passed++;
  } else {
    console.error("❌ Idempotency Failed: Duplicate event was processed.", result2);
  }

  // Test 3: Failure Degradation Simulation
  console.log("\n[Test 3] Failure Degradation Simulation (Forced Error via Bad API Key)");
  // Force a real Resend call by setting a bad API key
  process.env.RESEND_API_KEY = "re_bad_fake_key_for_testing_purposes";
  const FAILURE_ORDER_ID = "mock-order-fail-" + Date.now();
  
  // Notice this doesn't throw! It gracefully catches and returns success: false
  const result3 = await EmailService.sendDeliveryNotification(FAILURE_ORDER_ID, "ORD-TEST-999", MOCK_EMAIL);
  
  const log3 = await prisma.emailLog.findUnique({
    where: { idempotencyKey: `ORDER_DELIVERED_v1_${FAILURE_ORDER_ID}` }
  });

  if (!result3.success && result3.status === EmailStatus.FAILED && log3?.status === EmailStatus.FAILED) {
    console.log("✅ Degradation Passed: API failure was swallowed, caller survived, and failure logged to DB.");
    passed++;
  } else {
    console.error("❌ Degradation Failed: Service crashed or failed to log properly.", result3, log3);
  }

  // Cleanup logs
  await prisma.emailLog.deleteMany({
    where: {
      idempotencyKey: {
        in: [`ORDER_CONF_v1_${MOCK_ORDER_ID}`, `ORDER_DELIVERED_v1_${FAILURE_ORDER_ID}`]
      }
    }
  });

  console.log(`\nEmail Verification Results: ${passed}/${total} passed.`);
  if (passed !== total) process.exit(1);
}

testEmailSystem();
