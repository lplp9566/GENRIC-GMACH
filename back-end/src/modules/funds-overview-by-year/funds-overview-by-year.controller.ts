import { Body, Controller, Get, Patch } from '@nestjs/common';
import { FundsOverviewByYearService } from './funds-overview-by-year.service';

@Controller('funds-overview-by-year')
export class FundsOverviewByYearController {
  constructor(
    private readonly fundsOverviewByYearService: FundsOverviewByYearService,
  ) {}
  @Get()
  async getFundsOverviewByYear() {
    return await this.fundsOverviewByYearService.getAllFundsOverview();
  }
  @Patch('/update-fund-details')
  async updateFundDetails(
    @Body() body: { year: number; fundName: string; amount: number },
  ) {
    return await this.fundsOverviewByYearService.recordSpecialFundWithdrawalByName(
      body.year,
      body.fundName,
      body.amount,
    );
  }
}
