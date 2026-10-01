// modules/reporting/reporting.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async getSalesReport(tenantId: string, outletId: string, dateFrom: Date, dateTo: Date) {
    const orders = await this.prisma.orderHeader.findMany({
      where: {
        tenantId,
        outletId,
        status: "COMPLETED",
        completedAt: { gte: dateFrom, lte: dateTo },
      },
      include: { lines: true, payments: true },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, BigInt(0));
    const totalOrders = orders.length;
    const totalItems = orders.reduce((sum, o) => sum + o.lines.reduce((s, l) => s + l.qty, 0), 0);

    return {
      totalRevenue: Number(totalRevenue) / 100,
      totalOrders,
      totalItems,
      averageOrderValue: totalOrders > 0 ? Number(totalRevenue) / 100 / totalOrders : 0,
      period: `${dateFrom.toISOString().slice(0, 10)} to ${dateTo.toISOString().slice(0, 10)}`,
    };
  }

  async getRevenueByProduct(tenantId: string, outletId: string, dateFrom: Date, dateTo: Date) {
    const orders = await this.prisma.orderHeader.findMany({
      where: {
        tenantId, outletId, status: "COMPLETED",
        completedAt: { gte: dateFrom, lte: dateTo },
      },
      include: { lines: true },
    });

    const productRevenue = new Map();
    for (const order of orders) {
      for (const line of order.lines) {
        const current = productRevenue.get(line.variantId) || { qty: 0, revenue: BigInt(0) };
        productRevenue.set(line.variantId, {
          qty: current.qty + line.qty,
          revenue: current.revenue + line.lineTotal,
        });
      }
    }

    return Array.from(productRevenue.entries()).map(([variantId, data]) => ({
      variantId,
      qtySold: data.qty,
      revenue: Number(data.revenue) / 100,
    }));
  }

  async getFinancialReport(tenantId: string, year: number, month: number) {
    // Laba rugi sederhana berdasarkan jurnal
    const period = await this.prisma.accountingPeriod.findFirst({
      where: { tenantId, year, month },
    });

    if (!period) return null;

    const entries = await this.prisma.journalEntry.findMany({
      where: { periodId: period.id, status: "POSTED" },
      include: { lines: true },
    });

    let revenue = BigInt(0);
    let expenses = BigInt(0);

    for (const entry of entries) {
      for (const line of entry.lines) {
        // Asumsi: akun 4-xxxx adalah revenue, 6-xxxx adalah expense
        const accountCode = line.account.code;
        if (accountCode.startsWith("4")) {
          revenue += line.credit - line.debit;
        } else if (accountCode.startsWith("5") || accountCode.startsWith("6")) {
          expenses += line.debit - line.credit;
        }
      }
    }

    return {
      revenue: Number(revenue) / 100,
      expenses: Number(expenses) / 100,
      netIncome: Number(revenue - expenses) / 100,
      year,
      month,
    };
  }
}
