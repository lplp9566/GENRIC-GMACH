import { Controller, Post, Body, Get, Param, ParseIntPipe, Query, DefaultValuePipe, BadRequestException, ParseEnumPipe, ParseBoolPipe } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoanEntity } from './Entity/loans.entity';
import { LoanActionEntity } from './loan-actions/Entity/loan_actions.entity';
import { log } from 'console';
export enum LoanStatus {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

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
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(50), ParseIntPipe)
    limit: number,

    // new: active כ־boolean, undefined = כל ההלוואות
   @Query(
      'status',
      new DefaultValuePipe(LoanStatus.ALL),
      new ParseEnumPipe(LoanStatus, {
        exceptionFactory: () =>
          new BadRequestException(
            `status חייב להיות אחד מהערכים: ${Object.values(LoanStatus).join(', ')}`
          ),
      }),
    )
    status: LoanStatus,
  

    // במידה וצריך סינון לפי משתמש
    // @Query('userId', new DefaultValuePipe(undefined), ParseIntPipe)
    // userId?: number,
  ) {
    // console.log(`Fetching loans with page: ${page}, limit: ${limit}, active: ${status}`);
    return this.loansService.getLoans({ page, limit, status});
  }

  @Get(':id')
  async getLoan(
    @Param('id', ParseIntPipe) id: number
  ){
    return this.loansService.getLoanById(id);
  }

}
