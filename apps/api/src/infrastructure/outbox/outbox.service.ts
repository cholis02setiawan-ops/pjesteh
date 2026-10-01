// infrastructure/outbox/outbox.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DomainEvent } from "@prisma/client";

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private prisma: PrismaService) {}

  async createEvent(
    tx: any,
    tenantId: string,
    eventType: string,
    payload: any,
    refId: string,
  ): Promise<DomainEvent> {
    return tx.domainEvent.create({
      data: {
        tenantId,
        eventType,
        payload,
        status: "PENDING",
        refId,
        orderId: refId,
      },
    });
  }

  async getPendingEvents(limit: number = 100): Promise<DomainEvent[]> {
    return this.prisma.domainEvent.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async markSent(eventId: string) {
    await this.prisma.domainEvent.update({
      where: { id: eventId },
      data: { status: "SENT" },
    });
  }

  async markProcessed(eventId: string) {
    await this.prisma.domainEvent.update({
      where: { id: eventId },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
  }

  async markFailed(eventId: string) {
    await this.prisma.domainEvent.update({
      where: { id: eventId },
      data: { status: "FAILED", retryCount: { increment: 1 } },
    });
  }
}
