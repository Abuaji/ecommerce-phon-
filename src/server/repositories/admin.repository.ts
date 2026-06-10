import { prisma } from "@/lib/db";
import { AdminStatus, AuditAction, Prisma } from "@prisma/client";

export class AdminRepository {
  /**
   * Retrieves an active admin user by email, including their role and permissions.
   */
  static async getActiveAdminByEmail(email: string) {
    return prisma.adminUser.findFirst({
      where: {
        email,
        status: AdminStatus.ACTIVE,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  /**
   * Updates the last login timestamp for an admin.
   */
  static async updateLastLogin(adminId: string) {
    return prisma.adminUser.update({
      where: { id: adminId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Generates a system audit log for admin actions like login.
   */
  static async createAuditLog(data: {
    adminUserId: string;
    action: AuditAction;
    summary: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        adminUserId: data.adminUserId,
        action: data.action,
        summary: data.summary,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  }
}
