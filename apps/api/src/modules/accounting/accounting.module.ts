# modules/accounting/accounting.module.ts
import { Module } from "@nestjs/common";
import { AccountingService } from "./accounting.service";
import { AccountingController } from "./accounting.controller";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { OutboxModule } from "../../infrastructure/outbox/outbox.module";
import { EventBusModule } from "../../infrastructure/event-bus/event-bus.module";

@Module({
  imports: [PrismaModule, OutboxModule, EventBusModule],
  controllers: [AccountingController],
  providers: [AccountingService],
})
export class AccountingModule {}
