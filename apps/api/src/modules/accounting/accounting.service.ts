// modules/accounting/accounting.service.ts
import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { OutboxService } from "../../infrastructure/outbox/outbox.service";
import { Money } from "@esteh/money";

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

  constructor(
    private prisma: PrismaService,
    private outbox: OutboxService,
  ) {}

  async postJournalEntry(input: CreateJournalInput) {
    const { tenantId, sourceType, sourceRef, description, lines } = input;

    // Validasi debit = credit
    const totalDebit = lines.reduce((sum, l) => sum + l.debit, BigInt(0));
    const totalCredit = lines.reduce((sum, l) => sum + l.credit, BigInt(0));

    if (totalDebit !== totalCredit) {
      throw new BadRequestException(
        `Jurnal tidak seimbang: Debit ${totalDebit} ≠ Credit ${totalCredit}`,
      );
    }

    // Cek periode terbuka
    const now = new Date();
    const period = await this.prisma.accountingPeriod.findFirst({
      where: {
        tenantId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        status: "OPEN",
      },
    });

    if (!period) {
      throw new BadRequestException("Periode akuntansi tidak terbuka");
    }

    // Generate entry number
    const entryNumber = await this.generateEntryNumber(tenantId);

    const entry = await this.prisma.$transaction(async (tx) => {
      const journal = await tx.journalEntry.create({
        data: {
          tenantId,
          entryNumber,
          entryDate: now,
          periodId: period.id,
          sourceType,
          sourceRef,
          description,
          status: "POSTED",
          totalDebit,
          totalCredit,
          createdBy: input.createdBy,
          postedAt: now,
          lines: {
            create: lines.map((l, i) => ({
              accountId: l.accountId,
              debit: l.debit,
              credit: l.credit,
              outletId: l.outletId,
              lineNo: i + 1,
              memo: l.memo,
            })),
          },
        },
      });

      // Write to outbox for notification/reporting
      await this.outbox.createEvent(tx, tenantId, "JournalPosted", {
        entryNumber,
        journalId: journal.id,
        totalDebit: totalDebit.toString(),
        totalCredit: totalCredit.toString(),
      }, journal.id);

      return journal;
    });

    return entry;
  }

  async getProfitLoss(tenantId: string, year: number, month: number) {
    const period = await this.prisma.accountingPeriod.findFirst({
      where: { tenantId, year, month },
    });

    if (!period) throw new BadRequestException("Periode tidak ditemukan");

    const revenueLines = await this.prisma.journalLine.findMany({
      where: {
        entryId: { in: await this.getJournalIds(tenantId, period.id) },
      },
      include: { account: true },
    });

    const revenue = revenueLines
      .filter(l => l.account.type === "REVENUE")
      .reduce((sum, l) => sum + l.credit - l.debit, BigInt(0));

    const expenses = revenueLines
      .filter(l => l.account.type === "EXPENSE")
      .reduce((sum, l) => sum + l.debit - l.credit, BigInt(0));

    const grossProfit = revenue - expenses;
    const marginPercent = revenue > 0 ? Number((grossProfit * BigInt(10000)) / revenue) / 100 : 0;

    return {
      revenue: Number(revenue) / 100,
      expenses: Number(expenses) / 100,
      grossProfit: Number(grossProfit) / 100,
      marginPercent,
      period: `${year}-${String(month).padStart(2, "0")}`,
    };
  }

  async closePeriod(tenantId: string, year: number, month: number, closedBy: string) {
    const period = await this.prisma.accountingPeriod.findFirst({
      where: { tenantId, year, month, status: "OPEN" },
    });

    if (!period) throw new BadRequestException("Periode tidak ditemukan atau sudah ditutup");

    // Pastikan semua jurnal sudah posted
    const draftCount = await this.prisma.journalEntry.count({
      where: { periodId: period.id, status: "DRAFT" },
    });

    if (draftCount > 0) {
      throw new BadRequestException(`Ada ${draftCount} jurnal dalam status DRAFT. Tutup semua sebelum menutup periode.`);
    }

    await this.prisma.accountingPeriod.update({
      where: { id: period.id },
      data: { status: "SOFT_CLOSED", closedAt: new Date(), closedBy },
    });

    return { periodId: period.id, status: "SOFT_CLOSED" };
  }

  private async generateEntryNumber(tenantId: string): Promise<string> {
    const now = new Date();
    const prefix = `${tenantId}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const count = await this.prisma.journalEntry.count({
      where: { tenantId, entryNumber: { startsWith: prefix } },
    });
    return `${prefix}-${String(count + 1).padStart(4, "0")}`;
  }

  private async getJournalIds(tenantId: string, periodId: string) {
    const entries = await this.prisma.journalEntry.findMany({
      where: { periodId, tenantId },
      select: { id: true },
    });
    return entries.map(e => e.id);
  }
}

interface CreateJournalInput {
  tenantId: string;
  sourceType: string;
  sourceRef: string;
  description: string;
  lines: Array<{
    accountId: string;
    debit: bigint;
    credit: bigint;
    outletId?: string;
    memo?: string;
  }>;
  createdBy: string;
}
