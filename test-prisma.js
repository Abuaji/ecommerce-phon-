const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const orders = await prisma.order.findMany();
    console.log(orders);
  } catch (e) {
    console.error("ERROR MESSAGE:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
