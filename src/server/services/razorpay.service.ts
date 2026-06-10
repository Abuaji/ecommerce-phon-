import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "test_key_id";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "test_key_secret";
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret";

export const razorpayClient = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export class RazorpayService {
  /**
   * Generates a new Razorpay Order.
   * Amount must be in the smallest currency unit (e.g., paise for INR).
   */
  static async createOrder(amount: number, receiptId: string, currency = "INR") {
    // In test environment without real keys, mock it
    if (RAZORPAY_KEY_ID === "test_key_id" && process.env.NODE_ENV !== "production") {
      return {
        id: `mock_order_${Date.now()}`,
        amount,
        currency,
        receipt: receiptId,
        status: "created",
      };
    }

    return razorpayClient.orders.create({
      amount,
      currency,
      receipt: receiptId,
    });
  }

  /**
   * Cryptographically verifies the webhook payload using the shared secret.
   */
  static verifyWebhookSignature(payloadBody: string, signatureHeader: string): boolean {
    if (RAZORPAY_WEBHOOK_SECRET === "test_webhook_secret" && process.env.NODE_ENV !== "production") {
      // In purely programmatic testing environments, bypass if specific mock flag is provided.
      // But we will strictly enforce the real check if real keys are present.
      if (signatureHeader === "mock_signature_valid") return true;
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(payloadBody)
      .digest("hex");

    return expectedSignature === signatureHeader;
  }
}
