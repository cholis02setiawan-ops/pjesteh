// modules/reporting/reporting.module.ts
import { Module } from "@nestjs/common";
import { ReportingService } from "./reporting.service";
import { ReportingController } from "./reporting.controller";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ReportingController],
  providers: [ReportingService],
})
export class ReportingModule {}
