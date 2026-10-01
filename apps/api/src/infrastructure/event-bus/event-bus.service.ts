// infrastructure/event-bus/event-bus.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OutboxService } from "../outbox/outbox.service";

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(
    private prisma: PrismaService,
    private outbox: OutboxService,
  ) {}

  async publish(eventType: string, payload: any, orderId?: string) {
    this.logger.log(`Publishing event: ${eventType}`);
    // Event ditulis ke outbox via domain event pattern
    // Worker akan mengirim ke konsumen
  }

  async handleEvent(eventType: string, data: any) {
    this.logger.log(`Handling event: ${eventType}`);
  }
}
