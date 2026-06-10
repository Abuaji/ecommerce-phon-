import { prisma } from "@/lib/db";
import { Prisma, ReturnStatus,} from "@prisma/client";

export async function createReturnRequest(data: Prisma.ReturnCreateInput) {
  return prisma.return.create({
    data,
  });
}

export async function updateReturnStatus(returnId: string, status: ReturnStatus) {
  return prisma.return.update({
    where: { id: returnId },
    data: { status },
  });
}

export async function getReturnById(returnId: string) {
  return prisma.return.findUnique({
    where: { id: returnId },
  });
}
