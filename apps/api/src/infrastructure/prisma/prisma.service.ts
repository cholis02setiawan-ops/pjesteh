import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger("PrismaService");

  constructor() {
    super({
      log: process.env["NODE_ENV"] === "development"
        ? ["query", "info", "warn", "error"]
        : ["error", "warn"],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Prisma connected");
  }

  async enableLogger() {
    // Enable detailed logging in development
    if (process.env["NODE_ENV"] === "development") {
      this.$use([
        async (params, next) => {
          const start = Date.now();
          const result = await next(params);
          const duration = Date.now() - start;
          if (duration > 100) {
            this.logger.warn(
              `Slow query: ${params.model}.${params.action} took ${duration}ms`,
            );
          }
          return result;
        },
      ]);
    }
  }
}
