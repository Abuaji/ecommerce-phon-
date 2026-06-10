import { prisma } from "@/lib/db";
import { AdminRepository } from "@/server/repositories/admin.repository";
import { AuthService } from "@/server/services/auth.service";

async function main() {
  console.log("Starting Auth Validation...");

  // 1. Verify Admin Login Logic
  console.log("Testing Admin Login...");
  const adminEmail = "admin@example.com";
  const adminPassword = "adminpassword123";

  const admin = await AdminRepository.getActiveAdminByEmail(adminEmail);
  if (!admin) throw new Error("Admin not found!");
  if (!admin.password) throw new Error("Admin has no password!");

  const isPasswordValid = await AuthService.verifyPassword(adminPassword, admin.password);
  if (!isPasswordValid) throw new Error("Admin password verification failed!");
  console.log("✅ Admin Login Logic Passed");

  // 2. Verify Customer Registration & Login Logic
  console.log("Testing Customer Registration & Login...");
  const customerEmail = "customer@example.com";
  const customerPassword = "customerpassword123";
  const customerName = "Test Customer";

  // Cleanup old test customer
  await prisma.customer.deleteMany({ where: { email: customerEmail } });

  // Register
  const hashedPassword = await AuthService.hashPassword(customerPassword);
  await prisma.customer.create({
    data: {
      email: customerEmail,
      password: hashedPassword,
      name: customerName,
      isGuest: false,
    },
  });
  console.log("✅ Customer Registered");

  // Login
  const customer = await prisma.customer.findUnique({ where: { email: customerEmail } });
  if (!customer) throw new Error("Customer not found!");
  if (!customer.password) throw new Error("Customer has no password!");

  const isCustomerPasswordValid = await AuthService.verifyPassword(customerPassword, customer.password);
  if (!isCustomerPasswordValid) throw new Error("Customer password verification failed!");
  console.log("✅ Customer Login Logic Passed");

  console.log("✅ All Auth Validations Completed Successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Validation Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
