// modules/ordering/ordering.controller.ts
import { Controller, Post, Get, Param, Body, Query, UseGuards } from "@nestjs/common";
import { OrderingService } from "./ordering.service";
import { JwtAuthGuard } from "../../infrastructure/auth/jwt-auth.guard";
import { TenantGuard } from "../../infrastructure/auth/tenant.guard";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ConfirmOrderDto } from "./dto/confirm-order.dto";

@Controller("orders")
export class OrderingController {
  constructor(private readonly orderingService: OrderingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async create(@Body() dto: CreateOrderDto) {
    return this.orderingService.createOrder(dto);
  }

  @Post(":id/confirm")
  @UseGuards(JwtAuthGuard, TenantGuard)
  async confirm(@Param("id") orderId: string, @Body() dto: ConfirmOrderDto) {
    return this.orderingService.confirmOrder(orderId);
  }

  @Post(":id/cancel")
  @UseGuards(JwtAuthGuard, TenantGuard)
  async cancel(@Param("id") orderId: string, @Body() body: { reason: string; actor: string }) {
    return this.orderingService.cancelOrder(orderId, body.reason, body.actor);
  }

  @Post(":id/void")
  @UseGuards(JwtAuthGuard, TenantGuard)
  async void(@Param("id") orderId: string, @Body() body: { reason: string; approverId: string }) {
    return this.orderingService.voidOrder(orderId, body.reason, body.approverId);
  }

  @Get(":id/status")
  @UseGuards(JwtAuthGuard, TenantGuard)
  async status(@Param("id") orderId: string) {
    return this.orderingService.getOrderStatus(orderId);
  }

  @Get("/by-idempotency/:key")
  @UseGuards(JwtAuthGuard, TenantGuard)
  async findByIdempotency(@Param("key") key: string) {
    return this.orderingService.findByIdempotency(key);
  }
}
