// infrastructure/auth/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../../modules/auth/auth.service";
import { JwtPayload } from "../../modules/auth/auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(" ")[1];

    if (!token) return false;

    const payload = await this.authService.validateToken(token);
    if (!payload) return false;

    request.user = payload;
    return true;
  }
}
