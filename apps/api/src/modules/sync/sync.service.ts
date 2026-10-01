// modules/sync/sync.service.ts
import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

  async syncOrders(input: SyncOrdersInput) {
    const { deviceId, shiftId, orders } = input;
    const results = [];

    for (const order of orders) {
      try {
        // Check idempotency
        const existing = await this.prisma.orderHeader.findFirst({
          where: { idempotencyKey: order.idempotencyKey },
        });

        if (existing) {
          results.push({
            localRef: order.localRef,
            status: "DUPLICATE",
            orderId: existing.id,
            orderNumber: existing.orderNumber,
            duplicate: true,
          });
          continue;
        }

        // Create order
        const orderHeader = await this.prisma.orderHeader.create({
          data: {
            tenantId: input.tenantId,
            outletId: input.outletId,
            orderNumber: order.orderNumber,
            channel: order.channel,
            status: "CONFIRMED",
            shiftId,
            subtotal: order.subtotal,
            grandTotal: order.grandTotal,
            amountPaid: order.amountPaid,
            amountDue: order.amountDue,
            idempotencyKey: order.idempotencyKey,
            placedAt: order.placedAt,
            lines: {
              create: order.lines.map((line: any) => ({
                variantId: line.variantId,
                qty: line.qty,
                unitPrice: line.unitPrice,
                lineTotal: line.lineTotal,
              })),
            },
            payments: {
              create: order.payments.map((pay: any) => ({
                method: pay.method,
                amount: pay.amount,
                status: "PAID",
                issuedAt: order.placedAt,
              })),
            },
          },
        });

        results.push({
          localRef: order.localRef,
          status: "ACCEPTED",
          orderId: orderHeader.id,
          orderNumber: orderHeader.orderNumber,
          duplicate: false,
        });
      } catch (error) {
        this.logger.error(`Failed to sync order ${order.localRef}: ${error}`);
        results.push({
          localRef: order.localRef,
          status: "REJECTED",
          error: (error as Error).message,
        });
      }
    }

    return {
      results,
      serverTime: new Date().toISOString(),
      totalSynced: results.filter(r => r.status === "ACCEPTED").length,
      totalDuplicates: results.filter(r => r.duplicate).length,
      totalFailed: results.filter(r => r.status === "REJECTED").length,
    };
  }
}

interface SyncOrdersInput {
  tenantId: string;
  outletId: string;
  deviceId: string;
  shiftId: string;
  orders: Array<{
    localRef: string;
    idempotencyKey: string;
    placedAt: Date;
    channel: string;
    orderNumber: string;
    subtotal: bigint;
    grandTotal: bigint;
    amountPaid: bigint;
    amountDue: bigint;
    lines: Array<{
      variantId: string;
      qty: number;
      unitPrice: bigint;
      lineTotal: bigint;
    }>;
    payments: Array<{
      method: string;
      amount: bigint;
    }>;
  }>;
}
