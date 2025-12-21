import { Controller, Post, Body, Get, Param, ParseIntPipe, Query, DefaultValuePipe, BadRequestException, ParseEnumPipe, ParseBoolPipe, Patch } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoanEntity } from './Entity/loans.entity';
import { LoanActionEntity } from './loan-actions/Entity/loan_actions.entity';
import { log } from 'console';
import { FindOpts } from 'src/common';
import { EditLoanDto } from './loan-dto/editLoanDto';
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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe)
    limit: number,
    @Query(
      'status',
      new DefaultValuePipe(LoanStatus.ALL),
      new ParseEnumPipe(LoanStatus, {
        exceptionFactory: () =>
          new BadRequestException(
            `status חייב להיות אחד מהערכים: ${Object.values(LoanStatus).join(
              ', ',
            )}`,
          ),
      }),
    )
    status: LoanStatus,
    @Query('userId') userIdRaw?: number,
  ) {
    // let userId: number | undefined;
    // if (userIdRaw !== undefined) {
    //   // נסה לפרסר למספר
    //   userId = parseInt(userIdRaw, 10);
    //   if (isNaN(userId)) {
    //     // אם המחרוזת לא מכילה מספר תקין
    //     throw new BadRequestException('userId חייב להיות מספר תקין');
    //   }
    // }
    const opts: FindOpts = { page, limit };
    if (status !== LoanStatus.ALL) {
      opts.status = status;
    }
    if (userIdRaw !== undefined) {
      opts.userId = userIdRaw;
    }
    return this.loansService.getLoans(opts);
  }
  @Get('/id')
  async getLoan(
    @Query('id', ParseIntPipe) id: number
  ){
    return this.loansService.getLoanById(id);
  }
  @Patch(":id")
  editLoan(@Param("id") id: string, @Body() dto: EditLoanDto) {
    return this.loansService.editLoanSimple(Number(id), dto);
  }
}


