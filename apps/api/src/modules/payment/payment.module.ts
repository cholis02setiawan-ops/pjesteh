// modules/payment/payment.module.ts
import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { OutboxModule } from "../../infrastructure/outbox/outbox.module";

@Module({
  imports: [PrismaModule, OutboxModule],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
