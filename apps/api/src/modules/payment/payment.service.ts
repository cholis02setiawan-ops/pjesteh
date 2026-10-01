// modules/payment/payment.service.ts
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createPayment(input: CreatePaymentInput) {
    const { tenantId, payableType, payableId, method, amount, orderId } = input;

    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        payableType,
        payableId,
        method,
        amount,
        status: "PAID",
        issuedAt: new Date(),
        orderId,
      },
    });

    return payment;
  }

  async getPaymentByPayable(payableType: string, payableId: string) {
    return this.prisma.payment.findMany({
      where: { payableType, payableId },
    });
  }
}

interface CreatePaymentInput {
  tenantId: string;
  payableType: string;
  payableId: string;
  method: string;
  amount: bigint;
  orderId?: string;
}
