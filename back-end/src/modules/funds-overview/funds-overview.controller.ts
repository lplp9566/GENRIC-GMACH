import { Controller, Post, Body, Get, Patch } from '@nestjs/common';
import { FundsOverviewService } from './funds-overview.service';

@Controller('funds-overview')
export class FundsOverviewController {
  constructor(private readonly fundsOverviewService: FundsOverviewService) {}

  @Post('/initialize')
  async initializeFund(@Body() body: { initialAmount: number }) {
    return await this.fundsOverviewService.initializeFundsOverview(
      body.initialAmount,
    );
  }
  @Get()
  async getFundsOverview() {
    return await this.fundsOverviewService.getFundsOverviewRecord();
  }
  // @Post('/monthly-deposit')
  // async addMonthlyDeposit(@Body() body: { amount: number }) {
  //   return await this.fundsOverviewService.addMonthlyDeposit(body.amount);
  // }
  // @Post('/donation')
  // async addDonation(@Body() body: { amount: number }) {
  //   return await this.fundsOverviewService.adjustDonation(body.amount);
  // }
  // @Post('/investment')
  // async addInvestment(@Body() body: { amount: number }) {
  //   return await this.fundsOverviewService.addInvestment(body.amount);
  // }
  // @Post('/special-fund')
  // async addSpecialFund(@Body() body: { fundName: string; amount: number }) {
  //   return await this.fundsOverviewService.addSpecialFund(
  //     body.fundName,
  //     body.amount,
  //   );
  // }
  // @Post('/loan')
  // async addLoan(@Body() body: { amount: number }) {
  //   return await this.fundsOverviewService.addLoan(body.amount);
  // }
  // @Post('/repay-loan')
  // async repayLoan(@Body() body: { amount: number }) {
  //   return await this.fundsOverviewService.repayLoan(body.amount);
  // }
  // @Patch('/update-fund-details')
  // async updateFundDetails(@Body() body: { fundName: string; amount: number }) {
  //   return await this.fundsOverviewService.reduceFundAmount(
  //     body.amount,
  //   );
  // }
}
