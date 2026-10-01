// infrastructure/auth/tenant.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { TenantService } from "../../modules/tenant/tenant.service";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.headers["x-tenant-id"] || user?.tenantId;

    if (!tenantId) return false;

    request.tenantId = tenantId;
    request.outletId = request.headers["x-outlet-id"] || user?.outletId;
    return true;
  }
}
