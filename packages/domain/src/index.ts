// packages/domain/src/index.ts
// Entity definitions & pure business rules (no I/O)

export interface AggregateRoot {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValueObject {
  readonly [key: string]: unknown;
}

// Order status machine
export const ORDER_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["WAITING_PAYMENT", "CANCELLED"],
  WAITING_PAYMENT: ["CONFIRMED", "CANCELLED", "EXPIRED"],
  AWAITING_CONFIRMATION: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED", "VOIDED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["COMPLETED", "CANCELLED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  REFUNDED: [],
  CANCELLED: [],
  FAILED: [],
  EXPIRED: [],
};

export function canTransition(from: string, to: string): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

// Reservation status machine
export const RESERVATION_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PENDING_DEPOSIT"],
  PENDING_DEPOSIT: ["CONFIRMED", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["SEATED", "CANCELLED", "NO_SHOW"],
  SEATED: ["COMPLETED"],
  NO_SHOW: ["COMPLETED"],
  CANCELLED: [],
  COMPLETED: [],
  EXPIRED: [],
  REFUNDED: [],
};

export function canReserveTransition(from: string, to: string): boolean {
  return RESERVATION_TRANSITIONS[from]?.includes(to) ?? false;
}
