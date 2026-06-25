import { prisma } from "./src/lib/db";
async function main() {
  try {
    await prisma.payment.aggregate({
      where: { status: "CAPTURED" },
      _sum: { amount: true },
    });
    console.log("Success");
  } catch (e) {
    console.error(e);
  }
}
main();
