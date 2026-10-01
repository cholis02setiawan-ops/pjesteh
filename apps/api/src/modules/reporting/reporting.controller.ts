// modules/reporting/reporting.controller.ts
import { Controller, Get, Query } from "@nestjs/common";
import { ReportingService } from "./reporting.service";

@Controller("reports")
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get("sales")
  async salesReport(
    @Query("tenantId") tenantId: string,
    @Query("outletId") outletId: string,
    @Query("from") dateFrom: string,
    @Query("to") dateTo: string,
  ) {
    return this.reportingService.getSalesReport(tenantId, outletId, new Date(dateFrom), new Date(dateTo));
  }

  @Get("revenue-product")
  async revenueByProduct(
    @Query("tenantId") tenantId: string,
    @Query("outletId") outletId: string,
    @Query("from") dateFrom: string,
    @Query("to") dateTo: string,
  ) {
    return this.reportingService.getRevenueByProduct(tenantId, outletId, new Date(dateFrom), new Date(dateTo));
  }

  @Get("financial")
  async financialReport(
    @Query("tenantId") tenantId: string,
    @Query("year") year: number,
    @Query("month") month: number,
  ) {
    return this.reportingService.getFinancialReport(tenantId, year, month);
  }
}
