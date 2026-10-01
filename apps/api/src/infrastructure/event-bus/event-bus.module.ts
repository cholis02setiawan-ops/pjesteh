// infrastructure/event-bus/event-bus.module.ts
import { Module } from "@nestjs/common";
import { EventBusService } from "./event-bus.service";
import { RedisAdapter } from "@nestjs/platform-socket.io";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventBusModule {}
