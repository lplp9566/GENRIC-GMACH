import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { MonthlyDepositsService } from './monthly_deposits.service';
import { PaymentDetailsEntity } from '../users/payment-details/payment_details.entity';

@Controller('monthly-deposits')
export class MonthlyDepositsController {
  constructor(
    private readonly monthlyDepositsService: MonthlyDepositsService,
  ) {}
  @Get()
  async getAllMonthlyDeposits() {
    return this.monthlyDepositsService.getAllDeposits();
  }
  @Post()
  async recordMonthlyDeposit(@Body() paymentData: PaymentDetailsEntity) {
    return this.monthlyDepositsService.recordMonthlyDeposit(paymentData);
  }
  @Get('total/:userId')
  async getUserTotalDeposits(@Body() params: { userId: number }) {
    return this.monthlyDepositsService.getUserTotalDeposits(params.userId);
  }
@Get('user')
async getUserDeposits(@Query('userId', ParseIntPipe) userId: number) {
  return this.monthlyDepositsService.getUserDeposits(userId);
}
}
