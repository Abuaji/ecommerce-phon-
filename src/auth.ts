import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { LoginSchema } from "./validators/auth/auth.validator";
import { AdminRepository } from "./server/repositories/admin.repository";
import { prisma } from "./lib/db";
import { AuthService } from "./server/services/auth.service";
import { AuditAction } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-ignore
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password, type } = parsedCredentials.data;

          if (type === "ADMIN") {
            const admin = await AdminRepository.getActiveAdminByEmail(email);
            if (!admin || !admin.password) return null;

            const passwordsMatch = await AuthService.verifyPassword(password, admin.password);
            if (passwordsMatch) {
              await AdminRepository.updateLastLogin(admin.id);
              await AdminRepository.createAuditLog({
                adminUserId: admin.id,
                action: AuditAction.LOGIN,
                summary: "Admin successfully logged in",
              });

              return {
                id: admin.id,
                email: admin.email,
                name: admin.fullName,
                type: "ADMIN",
                roleId: admin.roleId,
                permissions: admin.role.permissions,
              };
            }
          } else if (type === "CUSTOMER") {
            const customer = await prisma.customer.findFirst({
              where: { email, isActive: true, isGuest: false },
            });
            if (!customer || !customer.password) return null;

            const passwordsMatch = await AuthService.verifyPassword(password, customer.password);
            if (passwordsMatch) {
              return {
                id: customer.id,
                email: customer.email,
                name: customer.name || "",
                type: "CUSTOMER",
              };
            }
          }
        }

        return null;
      },
    }),
  ],
});
