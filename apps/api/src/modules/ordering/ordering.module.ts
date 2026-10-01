import { Module } from "@nestjs/common";
import { OrderingService } from "./ordering.service";
import { OrderingController } from "./ordering.controller";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { EventBusModule } from "../../infrastructure/event-bus/event-bus.module";
import { OutboxModule } from "../../infrastructure/outbox/outbox.module";

@Module({
  imports: [PrismaModule, EventBusModule, OutboxModule],
  controllers: [OrderingController],
  providers: [OrderingService],
})
export class OrderingModule {}
