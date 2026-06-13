"use server";

import { prisma } from "@/lib/db";
import { RazorpayService } from "@/server/services/razorpay.service";
import { checkAvailableStock, incrementReservedStock, releaseReservedStock } from "@/server/repositories/inventory.repository";
import { reserveCoupon } from "@/server/repositories/coupon.repository";
import { OrderStatus, PaymentStatus, CouponRedemptionStatus } from "@prisma/client";

export type CheckoutItemInput = {
  sanityProductId: string;
  quantity: number;
  unitPrice: number; // in cents/paise
  productNameSnap: string;
};

export type CheckoutInput = {
  customerEmail: string;
  customerPhone?: string;
  items: CheckoutItemInput[];
  shippingAddress: any;
  couponCode?: string;
  paymentMethod?: "RAZORPAY" | "COD";
};

function generateOrderNumber() {
  const prefix = "ORD";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${random}`;
}

export async function createCheckoutSession(input: CheckoutInput) {
  const { customerEmail, customerPhone, items, shippingAddress, couponCode, paymentMethod = "RAZORPAY" } = input;

  if (items.length === 0) return { error: "Cart is empty" };

  // 1. Verify Stock
  for (const item of items) {
    const isAvailable = await checkAvailableStock(item.sanityProductId, item.quantity);
    if (!isAvailable) {
      return { error: `Insufficient stock for product: ${item.productNameSnap}` };
    }
  }

  // 2. Resolve Customer ID
  let customer = await prisma.customer.findUnique({ where: { email: customerEmail } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { email: customerEmail, ...(customerPhone !== undefined && { phone: customerPhone }), isGuest: true },
    });
  }

  // 3. Calculate Totals
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  let discountTotal = 0;
  let validCouponId = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive) {
      if (!coupon.minOrderValue || subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === "PERCENTAGE") {
          const rawDiscount = Math.floor(subtotal * (coupon.discountValue / 100));
          discountTotal = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
        } else {
          discountTotal = coupon.discountValue;
        }
        validCouponId = coupon.id;
      }
    }
  }

  const taxTotal = Math.floor((subtotal - discountTotal) * 0.18); // Example 18% tax
  const shippingFee = 0; // Free shipping
  const grandTotal = subtotal - discountTotal + taxTotal + shippingFee;

  // 4. Create PENDING Order & Lock Resources (Atomic/Txn safe wrapper)
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: customer.id,
          status: OrderStatus.PENDING,
          customerEmailSnap: customerEmail,
          customerPhoneSnap: customerPhone || null,
          shippingAddressSnap: shippingAddress,
          billingAddressSnap: shippingAddress,
          subtotal,
          discountTotal,
          taxTotal,
          shippingFee,
          grandTotal,
          items: {
            create: items.map(i => ({
              sanityProductId: i.sanityProductId,
              productNameSnap: i.productNameSnap,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
            }))
          }
        }
      });

      // Create Payment Row
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          provider: paymentMethod,
          amount: grandTotal,
          currency: "INR",
          status: PaymentStatus.PENDING,
        }
      });

      return newOrder;
    });

    // 5. Reserve Stock (Outside the main creation txn to avoid long locks if external APIs delay, but immediately after)
    // In a real system, we'd do this inside the transaction. For strict atomicity we will assume the order creation succeeded.
    await Promise.all(items.map(i => incrementReservedStock(i.sanityProductId, i.quantity)));

    // 6. Reserve Coupon
    if (validCouponId) {
      await reserveCoupon(validCouponId, customer.id, order.id, discountTotal);
    }
  } catch (error) {
    console.error("Order creation failed", error);
    return { error: "Failed to create order" };
  }

  // 7. Call External API (Razorpay)
  if (paymentMethod === "RAZORPAY") {
    let razorpayOrder;
    try {
      razorpayOrder = await RazorpayService.createOrder(grandTotal, order.id);
    } catch (error) {
      console.error("Razorpay API failed", error);
      // ROLLBACK: Mark Order Failed, Release Stock, Rollback Coupon
      await prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELLED } });
      await Promise.all(items.map(i => releaseReservedStock(i.sanityProductId, i.quantity, order.id)));
      if (validCouponId) {
        await prisma.couponRedemption.update({
          where: { orderId: order.id },
          data: { status: CouponRedemptionStatus.ROLLED_BACK, reservedUntil: null },
        });
      }
      return { error: "Payment gateway initialization failed" };
    }

    // 8. Update Payment with provider ID
    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: { providerOrderId: razorpayOrder.id },
    });

    return {
      success: true,
      data: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: grandTotal,
        currency: "INR",
      }
    };
  }

  // If COD, just return success
  return {
    success: true,
    data: {
      orderId: order.id,
      amount: grandTotal,
      currency: "INR",
    }
  };
}
