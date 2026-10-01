// modules/ordering/dto/create-order.dto.ts
export class CreateOrderDto {
  tenantId!: string;
  outletId!: string;
  channel!: "QR" | "POS" | "WEB" | "DELIVERY";
  items: { productId: string; variantId?: string; qty: number; modifiers?: any[] }[];
  customerId?: string;
  tableSessionId?: string;
  shiftId?: string;
  idempotencyKey?: string;
}

export class ConfirmOrderDto {
  paymentMethod?: string;
  customerName?: string;
}
