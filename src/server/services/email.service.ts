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

  private static async baseEmailTemplate(content: string, title: string = "Lumina Store") {
    // Fetch dynamic UI settings
    const settings = await prisma.storeSetting.findMany({
      where: { key: { in: ["email_store_name", "email_brand_color"] } }
    });
    const storeName = settings.find(s => s.key === "email_store_name")?.value || "LUMINA STORE";
    const brandColor = settings.find(s => s.key === "email_brand_color")?.value || "#000000";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
          .header { background-color: ${brandColor}; color: #ffffff; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
          .content { padding: 40px 30px; font-size: 16px; line-height: 1.6; color: #3f3f46; }
          .content h2 { color: #18181b; font-size: 20px; margin-top: 0; margin-bottom: 20px; }
          .footer { background-color: #fafafa; padding: 20px; text-align: center; font-size: 13px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
          .button { display: inline-block; padding: 12px 24px; background-color: ${brandColor}; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 20px; margin-bottom: 10px;}
          .highlight { background-color: #f4f4f5; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${brandColor}; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${storeName}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
            <p>This email was sent to you because you are a valued customer.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public static async sendOrderConfirmation(orderId: string, orderNumber: string, email: string, grandTotal: number, discountTotal: number = 0) {
    const subject = `Order Confirmation - ${orderNumber}`;
    const idempotencyKey = `ORDER_CONF_v1_${orderId}`;
    
    let discountHtml = "";
    if (discountTotal > 0) {
      discountHtml = `
      <div style="background-color: #fce7f3; color: #be185d; padding: 15px; border-radius: 6px; margin-top: 15px; margin-bottom: 15px; border-left: 4px solid #be185d;">
        <strong>🎉 Promotion Applied!</strong> You saved ₹${(discountTotal / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} on this order.
      </div>
      `;
    }

    const content = `
      <h2>Thank you for your order!</h2>
      <p>Your order <strong>#${orderNumber}</strong> has been successfully confirmed and payment was received.</p>
      
      ${discountHtml}
      
      <div class="highlight">
        <strong>Total Paid:</strong> ₹${(grandTotal / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>
      <p>We're getting your items ready. We will notify you once your order ships.</p>
      <center>
        <a href="https://yourstore.com/track-order" class="button">Track Your Order</a>
      </center>
    `;
    const html = await this.baseEmailTemplate(content, subject);

    return this.sendEmailSafe(email, subject, html, idempotencyKey, "Order", orderId);
  }

  public static async sendShippingNotification(orderId: string, orderNumber: string, email: string, trackingLink?: string) {
    const subject = `Your order ${orderNumber} has shipped!`;
    const idempotencyKey = `ORDER_SHIPPED_v1_${orderId}`;

    const content = `
      <h2>Great news, your order is on the way!</h2>
      <p>We have shipped your order <strong>#${orderNumber}</strong>.</p>
      ${trackingLink ? `
      <div class="highlight">
        <strong>Tracking Link:</strong> <br/>
        <a href="${trackingLink}" style="color: #000; word-break: break-all;">${trackingLink}</a>
      </div>
      ` : `<p>Your tracking information will be updated shortly.</p>`}
    `;
    const html = await this.baseEmailTemplate(content, subject);

    return this.sendEmailSafe(email, subject, html, idempotencyKey, "Order", orderId);
  }

  public static async sendDeliveryNotification(orderId: string, orderNumber: string, email: string) {
    const subject = `Your order ${orderNumber} has been delivered`;
    const idempotencyKey = `ORDER_DELIVERED_v1_${orderId}`;

    const content = `
      <h2>Your order has been delivered!</h2>
      <p>Your order <strong>#${orderNumber}</strong> was successfully delivered to your address.</p>
      <p>We hope you enjoy your new items! Thank you for shopping with Lumina Store.</p>
    `;
    const html = await this.baseEmailTemplate(content, subject);

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
    const content = `
      <p style="white-space: pre-wrap; font-size: 16px;">${message}</p>
    `;
    const html = await this.baseEmailTemplate(content, subject);

    return this.sendEmailSafe(recipient, subject, html, idempotencyKey, "Custom", undefined);
  }
}
