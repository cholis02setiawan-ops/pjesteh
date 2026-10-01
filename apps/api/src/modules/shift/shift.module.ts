// modules/shift/shift.module.ts
import { Module } from "@nestjs/common";
import { ShiftService } from "./shift.service";
import { ShiftController } from "./shift.controller";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ShiftController],
  providers: [ShiftService],
})
export class ShiftModule {}
