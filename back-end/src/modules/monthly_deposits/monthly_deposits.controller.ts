import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MonthlyDepositsService } from './monthly_deposits.service';
import { PaymentDetailsEntity } from '../users/payment-details/payment_details.entity';
import { payment_method } from '../users/userTypes';
export class updateMonthlyDepositDto {
 id:number
    user:number
    amount:number
    deposit_date:string
    description?:string
    payment_method:payment_method
}
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
  @Patch(':id')
  async updateMonthlyDeposit(@Param('id', ParseIntPipe) id: number, @Body() paymentData: updateMonthlyDepositDto) {
    return this.monthlyDepositsService.updateMonthlyDeposit(id, paymentData);
  }
}
