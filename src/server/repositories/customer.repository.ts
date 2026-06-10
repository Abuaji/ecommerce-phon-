import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function createCustomer(data: Prisma.CustomerCreateInput) {
  return prisma.customer.create({
    data,
  });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
  });
}

export async function getCustomerByEmail(email: string) {
  return prisma.customer.findUnique({
    where: { email },
  });
}
