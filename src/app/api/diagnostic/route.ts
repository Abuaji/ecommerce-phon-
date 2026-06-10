import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readClient } from "@/sanity/lib/client";

export async function GET() {
  const status = {
    sanity: { connected: false, productsCount: 0, error: null },
    database: { connected: false, usersCount: 0, error: null },
    timestamp: new Date().toISOString()
  };

  try {
    // Check Sanity
    const sanityResult = await readClient.fetch('count(*[_type == "product"])');
    status.sanity.connected = true;
    status.sanity.productsCount = sanityResult;
  } catch (error: any) {
    status.sanity.error = error.message;
  }

  try {
    // Check Prisma / Neon DB
    // Assuming there is a User or Account or Order model
    const dbResult = await prisma.customer.count().catch(async () => {
        // Fallback to testing raw query if Customer table doesn't exist
        return await prisma.$queryRaw`SELECT 1`.then(() => 1);
    });
    status.database.connected = true;
    status.database.usersCount = typeof dbResult === 'number' ? dbResult : 1;
  } catch (error: any) {
    status.database.error = error.message;
  }

  return NextResponse.json(status);
}
