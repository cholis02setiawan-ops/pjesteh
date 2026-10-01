// modules/tenant/tenant.service.ts
import { Injectable, ForbiddenException, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { AuditLogService } from "../audit/audit.service";

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditLogService,
  ) {}

  async getOutlet(tenantId: string, outletId: string) {
    const outlet = await this.prisma.outlet.findFirst({
      where: { id: outletId, tenantId, isActive: true },
    });

    if (!outlet) {
      throw new ForbiddenException("Outlet tidak ditemukan atau tidak aktif");
    }

    return outlet;
  }

  async getOutletByCode(tenantId: string, code: string) {
    const outlet = await this.prisma.outlet.findFirst({
      where: { tenantId, code, isActive: true },
    });

    if (!outlet) {
      throw new ForbiddenException("Outlet tidak ditemukan");
    }

    return outlet;
  }

  async getTenantUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, username: true, fullName: true, role: true, outletId: true },
    });
  }
}
