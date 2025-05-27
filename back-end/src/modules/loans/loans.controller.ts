import { Controller, Post, Body, Get, Param, ParseIntPipe, Query, DefaultValuePipe, BadRequestException } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoanEntity } from './Entity/loans.entity';
import { LoanActionEntity } from './loan-actions/Entity/loan_actions.entity';


@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  async createLoan(@Body() loanData: Partial<LoanEntity>) {
    return this.loansService.createLoan(loanData);
  }
  @Post('check-loan')
  async checkLoan(@Body() loanData: Partial<LoanEntity>) {
    return this.loansService.checkLoan(loanData);
  }
  @Get()
  findAll(
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe)  page:  number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,

    // כאן מקבלים כמחרוזת, ללא validate אוטומטי
    @Query('userId') userIdRaw?: string,
  ) {
    let userId: number | undefined;
    if (userIdRaw) {
      userId = parseInt(userIdRaw, 10);
      if (isNaN(userId)) {
        throw new BadRequestException('userId must be a number');
      }
    }
    return this.loansService.getLoans({ page, limit, userId });
  }

  @Get(':id')
  async getLoan(
    @Param('id', ParseIntPipe) id: number
  ){
    return this.loansService.getLoanById(id);
  }

}
