import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TenantModule } from "./modules/tenant/tenant.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { OrderingModule } from "./modules/ordering/ordering.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { ShiftModule } from "./modules/shift/shift.module";
import { AccountingModule } from "./modules/accounting/accounting.module";
import { ReservationModule } from "./modules/reservation/reservation.module";
import { DeliveryModule } from "./modules/delivery/delivery.module";
import { PromotionModule } from "./modules/promotion/promotion.module";
import { ReportingModule } from "./modules/reporting/reporting.module";
import { AuditModule } from "./modules/audit/audit.module";
import { SyncModule } from "./modules/sync/sync.module";
import { EventBusModule } from "./infrastructure/event-bus/event-bus.module";
import { WorkerModule } from "./infrastructure/worker/worker.module";
import { OutboxModule } from "./infrastructure/outbox/outbox.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    PrismaModule,
    EventBusModule,
    OutboxModule,
    WorkerModule,
    AuthModule,
    TenantModule,
    CatalogModule,
    OrderingModule,
    PaymentModule,
    ShiftModule,
    AccountingModule,
    ReservationModule,
    DeliveryModule,
    PromotionModule,
    ReportingModule,
    AuditModule,
    SyncModule,
  ],
})
export class AppModule {}
