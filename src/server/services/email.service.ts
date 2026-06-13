import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { EmailStatus } from "@prisma/client";

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export class EmailService {
  /**
   * Internal dispatcher that guarantees checkout/order flows never break on email failure,
   * while persisting attempt results to the database.
   */
  private static async sendEmailSafe(
    recipient: string,
    subject: string,
    html: string,
    idempotencyKey: string,
    entityType?: string,
    entityId?: string
  ) {
    try {
      // 1. Idempotency Check
      const existingLog = await prisma.emailLog.findUnique({
        where: { idempotencyKey }
      });

      if (existingLog) {
        console.log(`[EmailService] Skipping duplicate email for key: ${idempotencyKey}`);
        return { success: true, skipped: true };
      }

      // 2. Dispatch via Nodemailer
      let messageId: string | null = null;
      let errorMessage: string | null = null;
      let status: EmailStatus = EmailStatus.PENDING;

      try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
          // Dev mock bypass
          console.log(`[EmailService - MOCK] Missing GMAIL config. Sending mock email to ${recipient}: ${subject}`);
          messageId = "mock_gmail_id_123";
          status = EmailStatus.SENT;
        } else {
          const info = await transporter.sendMail({
            from: `"Lumina Store" <${process.env.GMAIL_USER}>`,
            to: recipient,
            subject,
            html,
          });

          messageId = info.messageId || null;
          status = EmailStatus.SENT;
        }
      } catch (err: any) {
        console.error(`[EmailService] Nodemailer Failed:`, err.message);
        errorMessage = err.message || "Unknown Provider Error";
        status = EmailStatus.FAILED;
      }

      // 3. Persist Log
      await prisma.emailLog.create({
        data: {
          recipientEmail: recipient,
          subject,
          idempotencyKey,
          status,
          providerId: messageId,
          errorMessage,
          entityType: entityType || null,
          entityId: entityId || null
        }
      });

      return { success: status === EmailStatus.SENT, status };
    } catch (criticalErr) {
      // Ultimate fallback: Even if DB fails, do not throw.
      console.error("[EmailService] CRITICAL FAILURE:", criticalErr);
      return { success: false, status: "CRITICAL_FAILURE" };
    }
  }

  // ---------------------------------------------------------------------------
  // PUBLIC EXPOSED EMAIL FLOWS
  // ---------------------------------------------------------------------------

  public static async sendOrderConfirmation(orderId: string, orderNumber: string, email: string, grandTotal: number) {
    const subject = `Order Confirmation - ${orderNumber}`;
    const idempotencyKey = `ORDER_CONF_v1_${orderId}`;
    
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Thank you for your order!</h2>
        <p>Your order <strong>${orderNumber}</strong> has been confirmed and payment was successful.</p>
        <p><strong>Total Paid:</strong> ₹${(grandTotal / 100).toLocaleString()}</p>
        <p>We will notify you once it ships. Track your order status below:</p>
        <a href="https://yourstore.com/track-order" style="display:inline-block; padding:10px 20px; background:#000; color:#fff; text-decoration:none; border-radius:5px;">Track Order</a>
      </div>
    `;

    return this.sendEmailSafe(email, subject, html, idempotencyKey, "Order", orderId);
  }

  public static async sendShippingNotification(orderId: string, orderNumber: string, email: string, trackingLink?: string) {
    const subject = `Your order ${orderNumber} has shipped!`;
    const idempotencyKey = `ORDER_SHIPPED_v1_${orderId}`;

    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Good news! Your order is on the way.</h2>
        <p>Order <strong>${orderNumber}</strong> has been shipped.</p>
        ${trackingLink ? `<p>Track your shipment here: <a href="${trackingLink}">${trackingLink}</a></p>` : `<p>Your tracking link will be updated on the tracking page shortly.</p>`}
      </div>
    `;

    return this.sendEmailSafe(email, subject, html, idempotencyKey, "Order", orderId);
  }

  public static async sendDeliveryNotification(orderId: string, orderNumber: string, email: string) {
    const subject = `Your order ${orderNumber} has been delivered`;
    const idempotencyKey = `ORDER_DELIVERED_v1_${orderId}`;

    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Delivered!</h2>
        <p>Your order <strong>${orderNumber}</strong> has been successfully delivered.</p>
        <p>Thank you for shopping with us!</p>
      </div>
    `;

    return this.sendEmailSafe(email, subject, html, idempotencyKey, "Order", orderId);
  }

  public static async sendAdminAlert(subject: string, message: string, alertId: string) {
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || "admin@example.com";
    const idempotencyKey = `ADMIN_ALERT_${alertId}`;

    const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 2px solid red;">
        <h2 style="color: red;">ADMIN ALERT</h2>
        <p>${message}</p>
      </div>
    `;

    return this.sendEmailSafe(adminEmail, subject, html, idempotencyKey);
  }

  public static async sendCustomEmail(recipient: string, subject: string, message: string) {
    const idempotencyKey = `CUSTOM_EMAIL_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <p style="white-space: pre-wrap; font-size: 15px;">${message}</p>
      </div>
    `;

    return this.sendEmailSafe(recipient, subject, html, idempotencyKey, "Custom", undefined);
  }
}
