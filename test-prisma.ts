import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    console.log("Success! Orders:", orders.length);
  } catch (e) {
    console.error("ERROR TYPE:", e.name);
    console.error("ERROR MESSAGE:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
