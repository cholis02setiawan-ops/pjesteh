// modules/ordering/ordering.service.ts
import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { Money } from "@esteh/money";
import { EventBusService } from "../../infrastructure/event-bus/event-bus.service";
import { OutboxService } from "../../infrastructure/outbox/outbox.service";

@Injectable()
export class OrderingService {
  private readonly logger = new Logger(OrderingService.name);

  constructor(
    private prisma: PrismaService,
    private eventBus: EventBusService,
    private outbox: OutboxService,
  ) {}

  async createOrder(input: CreateOrderInput) {
    const { outletId, channel, items, customerId, tableSessionId, shiftId } = input;

    // Hitung total
    const productPromises = items.map(async (item) => {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, outletId, isActive: true },
      });
      if (!product) throw new BadRequestException(`Produk ${item.productId} tidak tersedia`);

      const variant = product.variants.find(v => v.id === item.variantId);
      const unitPrice = variant
        ? Number(BigInt(product.basePrice) + BigInt(variant.priceDelta))
        : Number(product.basePrice);

      return {
        productId: item.productId,
        variantId: item.variantId || product.variants[0]?.id,
        qty: item.qty,
        unitPrice: BigInt(Math.round(unitPrice * 100)), // in sen
        modifiers: item.modifiers || [],
      };
    });

    const productDetails = await Promise.all(productPromises);
    const subtotal = productDetails.reduce(
      (sum, p) => sum + p.unitPrice * BigInt(p.qty),
      BigInt(0),
    );
    const grandTotal = subtotal; // Sederhana, tanpa diskon/pajak di awal

    // Buat order dalam transaksi
    const orderNumber = await this.generateOrderNumber(outletId);

    const order = await this.prisma.$transaction(async (tx) => {
      const orderHeader = await tx.orderHeader.create({
        data: {
          tenantId: input.tenantId,
          outletId,
          orderNumber,
          channel,
          status: "DRAFT",
          shiftId,
          tableSessionId,
          customerId,
          subtotal: grandTotal,
          discountTotal: BigInt(0),
          taxTotal: BigInt(0),
          grandTotal,
          amountDue: grandTotal,
          placedAt: new Date(),
          idempotencyKey: input.idempotencyKey,
        },
      });

      for (const detail of productDetails) {
        await tx.orderLine.create({
          data: {
            orderId: orderHeader.id,
            variantId: detail.variantId,
            qty: detail.qty,
            unitPrice: detail.unitPrice,
            lineTotal: detail.unitPrice * BigInt(detail.qty),
            unitCost: BigInt(0), // HPP dihitung saat order dikonfirmasi
          },
        });
      }

      // Tulis event ke outbox
      await this.outbox.createEvent(tx, input.tenantId, "OrderCreated", {
        orderId: orderHeader.id,
        outletId,
        channel,
        grandTotal: grandTotal.toString(),
      }, orderHeader.id);

      return orderHeader;
    });

    // Publish event async
    await this.eventBus.publish("OrderCreated", { orderId: order.id, outletId });

    return { orderNumber, orderId: order.id, status: order.status, grandTotal };
  }

  async confirmOrder(orderId: string) {
    const order = await this.prisma.orderHeader.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new BadRequestException("Pesanan tidak ditemukan");
    if (order.status !== "DRAFT" && order.status !== "WAITING_PAYMENT") {
      throw new BadRequestException("Pesanan tidak bisa dikonfirmasi");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.orderHeader.update({
        where: { id: orderId },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      });

      // Kurangi stok berdasarkan resep
      const lines = await tx.orderLine.findMany({ where: { orderId } });
      for (const line of lines) {
        const product = await tx.product.findUnique({
          where: { id: line.variantId },
        });
        if (product?.recipeLines) {
          for (const recipe of product.recipeLines) {
            const ingredientId = recipe.ingredientId;
            const qty = recipe.quantity * BigInt(line.qty);
            await tx.ingredient.update({
              where: { id: ingredientId },
              data: {
                stockBalance: { decrement: qty },
                stockValue: { decrement: qty * recipe.ingredient.unitCost },
              },
            });

            await tx.stockMovement.create({
              data: {
                tenantId: order.tenantId,
                outletId: order.outletId,
                ingredientId,
                refType: "SALE",
                refId: orderId,
                quantityOut: qty,
                unitCost: recipe.ingredient.unitCost,
                balanceQtyAfter: 0, // Will be calculated properly
                balanceValueAfter: 0,
              },
            });
          }
        }
      }

      return updated;
    });

    await this.outbox.createEvent(this.prisma, order.tenantId, "OrderConfirmed", {
      orderId,
      outletId: order.outletId,
    }, orderId);

    return updated;
  }

  async cancelOrder(orderId: string, reason: string, actor: string) {
    const order = await this.prisma.orderHeader.findFirst({
      where: { id: orderId },
    });

    if (!order) throw new BadRequestException("Pesanan tidak ditemukan");
    if (order.status === "CANCELLED" || order.status === "COMPLETED") {
      throw new BadRequestException("Pesanan sudah tidak bisa dibatalkan");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.orderHeader.update({
        where: { id: orderId },
        data: { status: "CANCELLED", cancelReason: reason, cancelledBy: actor, cancelledAt: new Date() },
      });

      await this.outbox.createEvent(tx, order.tenantId, "OrderCancelled", {
        orderId,
        outletId: order.outletId,
        reason,
      }, orderId);
    });

    return { orderId, status: "CANCELLED" };
  }

  async voidOrder(orderId: string, reason: string, approverId: string) {
    const order = await this.prisma.orderHeader.findFirst({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) throw new BadRequestException("Pesanan tidak ditemukan");
    if (order.status !== "CONFIRMED") {
      throw new BadRequestException("Hanya pesanan yang dikonfirmasi yang bisa di-void");
    }

    // Void memerlukan persetujuan supervisor
    const approver = await this.prisma.user.findUnique({
      where: { id: approverId },
    });

    if (!approver || approver.role !== "SUPERVISOR") {
      throw new BadRequestException("Void memerlukan persetujuan supervisor");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.orderHeader.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          voidedAt: new Date(),
          voidReason: reason,
          voidedBy: approverId,
        },
      });

      // Reverse payment
      for (const payment of order.payments) {
        if (payment.status === "PAID") {
          await tx.payment.create({
            data: {
              tenantId: order.tenantId,
              payableType: "ORDER",
              payableId: orderId,
              method: payment.method,
              amount: payment.amount,
              status: "REFUNDED",
              issuedAt: new Date(),
            },
          });
        }
      }

      await this.outbox.createEvent(tx, order.tenantId, "OrderVoided", {
        orderId,
        outletId: order.outletId,
        reason,
        approverId,
      }, orderId);
    });

    return { orderId, status: "VOIDED" };
  }

  private async generateOrderNumber(outletId: string): Promise<string> {
    const outlet = await this.prisma.outlet.findUnique({
      where: { id: outletId },
      select: { code: true },
    });
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await this.prisma.orderHeader.count({
      where: { outletId, createdAt: { gte: new Date(new Date().toISOString().slice(0, 10)) } },
    });
    return `${outlet?.code || "XX"}-${today}-${String(count + 1).padStart(4, "0")}`;
  }
}

interface CreateOrderInput {
  tenantId: string;
  outletId: string;
  channel: string;
  items: { productId: string; variantId?: string; qty: number; modifiers?: any[] }[];
  customerId?: string;
  tableSessionId?: string;
  shiftId?: string;
  idempotencyKey?: string;
}
