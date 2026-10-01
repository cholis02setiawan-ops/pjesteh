// modules/shift/shift.service.ts
import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Injectable()
export class ShiftService {
  private readonly logger = new Logger(ShiftService.name);

  constructor(private prisma: PrismaService) {}

  async openShift(input: OpenShiftInput) {
    const { outletId, staffId, openingFloat, tenantId } = input;

    const existingOpen = await this.prisma.shift.findFirst({
      where: { outletId, status: "OPEN" },
    });

    if (existingOpen) {
      throw new BadRequestException("Shift sudah terbuka untuk outlet ini");
    }

    const shiftNumber = await this.getNextShiftNumber(outletId);
    const shift = await this.prisma.shift.create({
      data: {
        tenantId,
        outletId,
        shiftNumber,
        staffId,
        openedBy: staffId,
        openedAt: new Date(),
        openedFloat: BigInt(Math.round(openingFloat * 100)),
        expectedCash: BigInt(Math.round(openingFloat * 100)),
        status: "OPEN",
      },
    });

    await this.prisma.cashMovement.create({
      data: {
        tenantId,
        shiftId: shift.id,
        type: "PURCHASE",
        amount: BigInt(Math.round(openingFloat * 100)),
        note: "Modal awal shift",
      },
    });

    return { shiftId: shift.id, shiftNumber, openedAt: shift.openedAt };
  }

  async closeShift(input: CloseShiftInput) {
    const { shiftId, countedCash, staffId } = input;

    const shift = await this.prisma.shift.findFirst({
      where: { id: shiftId, status: "OPEN" },
      include: { orders: { where: { status: "COMPLETED" } }, cashMoves: true },
    });

    if (!shift) throw new BadRequestException("Shift tidak ditemukan atau sudah ditutup");

    const totalSales = shift.orders.reduce((sum, o) => sum + o.grandTotal, BigInt(0));
    const totalCashIn = shift.cashMoves
      .filter(m => m.type === "PURCHASE")
      .reduce((sum, m) => sum + m.amount, BigInt(0));
    const totalCashOut = shift.cashMoves
      .filter(m => m.type === "WASTE")
      .reduce((sum, m) => sum + m.amount, BigInt(0));

    const expectedCash = totalCashIn - totalCashOut + shift.openedFloat;
    const variance = countedCash - expectedCash;
    const varianceAmount = variance > 0 ? "MORE" : "LESS";

    const updated = await this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        countedCash: BigInt(Math.round(countedCash * 100)),
        expectedCash,
        variance: variance < 0 ? -variance : variance,
        status: "CLOSED",
        closedAt: new Date(),
        closedBy: staffId,
        totalSales,
        paymentCount: shift.orders.length,
      },
    });

    // Journal entry for variance if needed
    if (Math.abs(Number(variance)) > 0) {
      const accountCode = await this.getAccountCode(shift.tenantId, "6-1900");
      const cashAccountCode = await this.getAccountCode(shift.tenantId, "1-1100");
      const tenantId = shift.tenantId;

      await this.prisma.journalEntry.create({
        data: {
          tenantId,
          entryNumber: `JS-${tenantId}-${new Date().toISOString().slice(0, 10)}-${shiftId.slice(0, 8)}`,
          entryDate: new Date(),
          periodId: await this.getCurrentPeriodId(tenantId),
          sourceType: "SALES",
          sourceRef: shiftId,
          description: `Selisih kas shift ${shift.shiftNumber} - ${varianceAmount}`,
          status: "POSTED",
          totalDebit: variance > 0 ? variance : BigInt(0),
          totalCredit: variance < 0 ? -variance : BigInt(0),
          createdBy: staffId,
          postedAt: new Date(),
          lines: [
            {
              accountId: accountCode,
              debit: variance > 0 ? variance : BigInt(0),
              credit: variance < 0 ? -variance : BigInt(0),
              outletId: shift.outletId,
              lineNo: 1,
              memo: `Selisih kas shift ${shift.shiftNumber}`,
            },
            {
              accountId: cashAccountCode,
              debit: variance < 0 ? -variance : BigInt(0),
              credit: variance > 0 ? variance : BigInt(0),
              outletId: shift.outletId,
              lineNo: 2,
              memo: `Penyesuaian selisih kas shift ${shift.shiftNumber}`,
            },
          ],
        },
      });
    }

    return {
      shiftId,
      shiftNumber: shift.shiftNumber,
      totalSales: Number(totalSales) / 100,
      expectedCash: Number(expectedCash) / 100,
      countedCash: Number(countedCash) / 100,
      variance: Number(variance) / 100,
      varianceAmount,
    };
  }

  async getCurrentShift(outletId: string) {
    return this.prisma.shift.findFirst({
      where: { outletId, status: "OPEN" },
      include: { staff: { select: { fullName: true } } },
    });
  }

  private async getNextShiftNumber(outletId: string): Promise<number> {
    const count = await this.prisma.shift.count({ where: { outletId } });
    return count + 1;
  }

  private async getCurrentPeriodId(tenantId: string): Promise<string> {
    const now = new Date();
    const period = await this.prisma.accountingPeriod.findFirst({
      where: {
        tenantId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        status: "OPEN",
      },
    });
    return period?.id || "";
  }

  private async getAccountCode(tenantId: string, code: string): Promise<string> {
    const account = await this.prisma.chartOfAccount.findFirst({
      where: { tenantId, code },
    });
    return account?.id || "";
  }
}

interface OpenShiftInput {
  tenantId: string;
  outletId: string;
  staffId: string;
  openingFloat: number;
}

interface CloseShiftInput {
  shiftId: string;
  countedCash: number;
  staffId: string;
}
