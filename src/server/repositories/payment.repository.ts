import { prisma } from "@/lib/db";
import { Prisma, PaymentStatus,} from "@prisma/client";

/**
 * Creates a payment intent/record.
 */
export async function createPayment(data: Prisma.PaymentCreateInput) {
  return prisma.payment.create({
    data,
  });
}

/**
 * Updates a payment by its provider ID (Idempotent approach).
 */
export async function updatePaymentStatusByProviderId(
  providerPaymentId: string, 
  status: PaymentStatus
) {
  return prisma.payment.update({
    where: { providerPaymentId },
    data: { status },
  });
}

/**
 * Gets a payment by provider ID. Used for idempotency checks.
 */
export async function getPaymentByProviderId(providerPaymentId: string) {
  return prisma.payment.findUnique({
    where: { providerPaymentId },
  });
}
