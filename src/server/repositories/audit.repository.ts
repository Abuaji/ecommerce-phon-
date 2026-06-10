import { prisma } from "@/lib/db";
import { AuditAction } from "@prisma/client";

export interface CreateAuditLogParams {
  adminUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  action: AuditAction;
  summary: string;
  entityType?: string;
  entityId?: string;
  details?: any;
}

export class AuditRepository {
  /**
   * Creates a new audit log entry
   */
  static async createLog(params: CreateAuditLogParams) {
    const data: any = {
      action: params.action,
      summary: params.summary,
    };
    if (params.adminUserId) data.adminUserId = params.adminUserId;
    if (params.ipAddress) data.ipAddress = params.ipAddress;
    if (params.userAgent) data.userAgent = params.userAgent;
    if (params.entityType) data.entityType = params.entityType;
    if (params.entityId) data.entityId = params.entityId;
    if (params.details) data.details = JSON.parse(JSON.stringify(params.details));

    return prisma.auditLog.create({ data });
  }

  /**
   * Retrieves paginated audit logs for a specific entity or action
   */
  static async getLogs(options: {
    page?: number;
    limit?: number;
    action?: AuditAction;
    adminUserId?: string;
    entityType?: string;
    entityId?: string;
  }) {
    const { page = 1, limit = 50, action, adminUserId, entityType, entityId } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = action;
    if (adminUserId) where.adminUserId = adminUserId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          adminUser: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, pages: Math.ceil(total / limit) };
  }
}
