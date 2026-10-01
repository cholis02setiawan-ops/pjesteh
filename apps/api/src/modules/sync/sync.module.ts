// modules/sync/sync.module.ts
import { Module } from "@nestjs/common";
import { SyncService } from "./sync.service";
import { SyncController } from "./sync.controller";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { OutboxModule } from "../../infrastructure/outbox/outbox.module";

@Module({
  imports: [PrismaModule, OutboxModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
