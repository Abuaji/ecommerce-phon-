import { NextRequest, NextResponse } from "next/server";
import { RazorpayService } from "@/server/services/razorpay.service";
import { prisma } from "@/lib/db";
import { fulfillReservedStock, releaseReservedStock } from "@/server/repositories/inventory.repository";
import { confirmCouponRedemption, rollbackCouponRedemption } from "@/server/repositories/coupon.repository";
import { updateOrderStatus } from "@/server/repositories/order.repository";

import { PaymentStatus, OrderStatus, AuditAction } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // 1. Cryptographic Signature Verification
    const isValid = RazorpayService.verifyWebhookSignature(bodyText, signature);
    if (!isValid) {
      console.error("Webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;
    const paymentEntity = payload.payload.payment.entity;

    const providerOrderId = paymentEntity.order_id;
    const providerPaymentId = paymentEntity.id;

    if (!providerOrderId) {
      return NextResponse.json({ error: "No order ID in payload" }, { status: 400 });
    }

    // 2. Locate Payment & Idempotency Check
    const payment = await prisma.payment.findFirst({
      where: { providerOrderId },
      include: { order: { include: { items: true, couponRedemption: true } } },
    });

    if (!payment) {
      console.error(`Payment row not found for providerOrderId: ${providerOrderId}`);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Idempotency check: Ignore if already processed
    if (payment.status === PaymentStatus.CAPTURED && event === "payment.captured") {
      return NextResponse.json({ status: "already processed" }, { status: 200 });
    }
    if (payment.status === PaymentStatus.FAILED && event === "payment.failed") {
      return NextResponse.json({ status: "already processed" }, { status: 200 });
    }

    // 3. Process Events
    if (event === "payment.captured") {
      // 3a. Update Payment & Order
      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerPaymentId, status: PaymentStatus.CAPTURED },
      });
      await updateOrderStatus(payment.orderId, OrderStatus.CONFIRMED);

      // 3b. Confirm Coupon
      if (payment.order.couponRedemption) {
        await confirmCouponRedemption(payment.orderId!);
      }

      // 3c. Fulfill Inventory
      for (const item of payment.order.items) {
        await fulfillReservedStock(item.sanityProductId!, item.quantity, payment.orderId);
      }

      // 3d. Audit Log
      await prisma.auditLog.create({
        data: {
          action: AuditAction.ORDER_STATUS_CHANGED,
          summary: `Order ${payment.order.orderNumber} confirmed via Webhook`,
          entityType: "Order",
          entityId: payment.orderId,
          details: { providerPaymentId },
        },
      });

      // 3e. Automated Emails
      const settings = await prisma.storeSetting.findMany();
      const isConfirmEnabled = settings.find(s => s.key === "enable_order_confirm_emails")?.value === "true";
      if (isConfirmEnabled && payment.order.customerEmailSnap) {
        // Need to import EmailService at the top
        const { EmailService } = await import("@/server/services/email.service");
        await EmailService.sendOrderConfirmation(
          payment.orderId,
          payment.order.orderNumber,
          payment.order.customerEmailSnap,
          payment.order.grandTotal,
          payment.order.discountTotal || 0
        );
      }

    } else if (event === "payment.failed") {
      // 4a. Update Payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerPaymentId, status: PaymentStatus.FAILED, errorMessage: paymentEntity.error_description },
      });
      
      // Order status remains whatever it was (PENDING), or could be moved to CANCELLED/FAILED depending on biz logic.
      // We'll leave order PENDING or mark CANCELLED so stock is freed. Let's do CANCELLED.
      await updateOrderStatus(payment.orderId, OrderStatus.CANCELLED);

      // 4b. Rollback Coupon
      if (payment.order.couponRedemption) {
        await rollbackCouponRedemption(payment.orderId);
      }

      // 4c. Release Inventory
      for (const item of payment.order.items) {
        await releaseReservedStock(item.sanityProductId!, item.quantity, payment.orderId);
      }

      // 4d. Audit Log
      await prisma.auditLog.create({
        data: {
          action: AuditAction.ORDER_STATUS_CHANGED,
          summary: `Order ${payment.order.orderNumber} failed via Webhook. Resources released.`,
          entityType: "Order",
          entityId: payment.orderId,
          details: { error: paymentEntity.error_description },
        },
      });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
