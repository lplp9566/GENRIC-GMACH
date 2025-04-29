import { Controller, Post, Body, Get } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoanEntity } from './loans.entity';
import { LoanPaymentEntity } from './loan-payments/loan_payments.entity';


@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  async createLoan(@Body() loanData: Partial<LoanEntity>) {
    return this.loansService.createLoan(loanData);
  }
@Get()
  async getLoans() {
    return this.loansService.getLoans();
  }
  @Get('loan/:id')
  async getLoan(@Body('id') id: number) {
    return this.loansService.getLoanById(id);
  }

}
