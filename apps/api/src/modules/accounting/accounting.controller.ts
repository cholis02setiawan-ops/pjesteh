// modules/accounting/accounting.controller.ts
import { Controller, Post, Get, Param, Body } from "@nestjs/common";
import { AccountingService } from "./accounting.service";

@Controller("accounting")
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post("journal")
  async postJournal(@Body() body: any) {
    return this.accountingService.postJournalEntry(body);
  }

  @Get("journal")
  async getJournal(@Param("periodId") periodId: string) {
    return this.accountingService.getJournalEntries(periodId);
  }

  @Get("profit-loss")
  async profitLoss(
    @Param("tenantId") tenantId: string,
    @Param("year") year: number,
    @Param("month") month: number,
  ) {
    return this.accountingService.getProfitLoss(tenantId, year, month);
  }

  @Post("periods/:id/close")
  async closePeriod(@Param("id") periodId: string, @Body() body: { closedBy: string }) {
    return this.accountingService.closePeriod("", 0, 0, body.closedBy);
  }
}
