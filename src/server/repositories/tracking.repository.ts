import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function createTrackingEvent(data: Prisma.TrackingEventCreateInput) {
  return prisma.trackingEvent.create({
    data,
  });
}

export async function getTrackingEventsByShipment(shipmentId: string) {
  return prisma.trackingEvent.findMany({
    where: { shipmentId },
    orderBy: { timestamp: "desc" },
  });
}
