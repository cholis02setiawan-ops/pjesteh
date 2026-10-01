// modules/payment/payment.controller.ts
import { Controller, Post, Get } from "@nestjs/common";
import { PaymentService } from "./payment.service";

@Controller("payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() body: any) {
    return this.paymentService.createPayment(body);
  }

  @Post("checkout")
  async checkout(@Body() body: any) {
    // Ini akan integrate dengan payment gateway (QRIS, VA, e-wallet)
    return { paymentUrl: "", transactionId: "", expiresAt: new Date() };
  }

  @Get("order/:orderId")
  async getByOrder(@Param("orderId") orderId: string) {
    return this.paymentService.getPaymentByPayable("ORDER", orderId);
  }
}
