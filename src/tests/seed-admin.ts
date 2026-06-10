import { prisma } from "@/lib/db";
import { AuthService } from "@/server/services/auth.service";
import { AdminStatus } from "@prisma/client";

async function main() {
  console.log("Seeding Root Admin...");

  // 1. Check if Root Role exists, or create it
  let role = await prisma.role.findUnique({
    where: { name: "Super Admin" },
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        name: "Super Admin",
        description: "Unrestricted access to all modules",
        isSystem: true,
        permissions: {
          create: {
            module: "*",
            actions: ["*"],
          },
        },
      },
    });
    console.log("✅ Created 'Super Admin' role.");
  }

  // 2. Check if Root Admin exists, or create it
  const email = "admin@example.com";
  const password = "adminpassword123";

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email } });

  if (!existingAdmin) {
    const hashedPassword = await AuthService.hashPassword(password);
    const admin = await prisma.adminUser.create({
      data: {
        fullName: "Root Administrator",
        email,
        password: hashedPassword,
        roleId: role.id,
        status: AdminStatus.ACTIVE,
      },
    });
    console.log("✅ Created Root Admin:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${password}`);
  } else {
    console.log("⚠️ Root Admin already exists.");
    console.log(`   Email: ${existingAdmin.email}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
