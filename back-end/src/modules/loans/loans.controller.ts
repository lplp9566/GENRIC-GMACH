import { Controller, Post, Body } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoanEntity } from './loans.entity';
import { LoanPaymentEntity } from './loan-payments/loan_payments.entity';
import {  AddPaymentDto } from 'src/types/loanTypes';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  async createLoan(@Body() loanData: Partial<LoanEntity>) {
    return this.loansService.createLoan(loanData);
  }

  @Post('payment')
  async addPayment(@Body() paymentData: AddPaymentDto) {
    return this.loansService.addPayment(paymentData);
  }
}
