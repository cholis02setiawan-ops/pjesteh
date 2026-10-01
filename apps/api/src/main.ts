import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PrismaService } from "./infrastructure/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env["CORS_ORIGIN"] || "http://localhost:3000",
      credentials: true,
    },
  });

  const prisma = app.get(PrismaService);
  await prisma.enableLogger();

  const port = ConfigService.get("PORT") || 4000;
  await app.listen(port);

  logger.log(`API running on port ${port}`);
}

bootstrap();
