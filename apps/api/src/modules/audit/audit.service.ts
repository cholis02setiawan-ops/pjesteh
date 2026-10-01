// modules/audit/audit.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(input: {
    tenantId: string;
    outletId?: string;
    userId?: string;
    action: string;
    entity?: string;
    entityId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    traceId?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        outletId: input.outletId,
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        oldValue: input.oldValue ? JSON.stringify(input.oldValue) : null,
        newValue: input.newValue ? JSON.stringify(input.newValue) : null,
        ipAddress: input.ipAddress,
        traceId: input.traceId,
      },
    });
  }

  async getLogs(tenantId: string, filters?: {
    action?: string;
    entity?: string;
    from?: Date;
    to?: Date;
    limit?: number;
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        action: filters?.action,
        entity: filters?.entity,
        createdAt: {
          gte: filters?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: filters?.to || new Date(),
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit || 100,
    });
  }
}
