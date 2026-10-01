// modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
  outletId?: string;
  tenantId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(username: string, password: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { username, tenantId, isActive: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Kredensial tidak valid");
    }

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      outletId: user.outletId,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwt.sign(payload, { expiresIn: "15m" });
    const refreshToken = this.jwt.sign(payload, { expiresIn: "7d" });

    await this.createSession(user.id, accessToken, refreshToken);

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      return this.jwt.verify(token) as JwtPayload;
    } catch {
      return null;
    }
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwt.verify(refreshToken) as JwtPayload;
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token tidak valid");
    }

    const newAccessToken = this.jwt.sign(payload, { expiresIn: "15m" });
    await this.prisma.session.update({
      where: { id: session.id },
      data: { token: newAccessToken },
    });

    return { accessToken: newAccessToken };
  }

  private async createSession(userId: string, token: string, refreshToken: string) {
    await this.prisma.session.create({
      data: {
        userId,
        token,
        refreshToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
