import { BadRequestException, Body, Controller, DefaultValuePipe, Get, Param, ParseEnumPipe, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { DepositsEntity } from './Entity/deposits.entity';
import { LoanStatus as StatusCordi } from 'src/common';
import { DepositsFlowService } from './DepositsFlow.service';

export interface BringForwardDto {
  newReturnDate: string; 
}
@Controller('deposits')
export class DepositsController {
    constructor(
 private readonly depositsService: DepositsService,
 private readonly depositsFlowService: DepositsFlowService,
    ) {}
    @Get()
    async getDeposits(
 @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe)
    limit: number,  
     @Query(
           'status',
           new DefaultValuePipe(StatusCordi.ALL),
           new ParseEnumPipe(StatusCordi, {
             exceptionFactory: () =>
               new BadRequestException(
                 `status חייב להיות אחד מהערכים: ${Object.values(StatusCordi).join(
                   ', ',
                 )}`,
               ),
           }),
         )
         status: StatusCordi,
         @Query('userId') userIdRaw?: number,
   ) {
    const opts: { page: number; limit: number; status?: StatusCordi; userId?: number } = { page, limit };
    if (status !== StatusCordi.ALL) {
      opts.status = status;
    }
    if (userIdRaw !== undefined) {
      opts.userId = parseInt(userIdRaw as any, 10);
    }
        return await this.depositsService.getDeposits(opts);
      }
      @Get('active')
      async getDepositsActive() {
        return await this.depositsService.getDepositsActive();
      }
      @Get(':id')
      async getDepositById(@Param('id', ParseIntPipe) id: number) {
        return await this.depositsService.getDepositById(id);
      }
      @Post()
      async createDeposit(@Body() deposit: DepositsEntity) {
        return await this.depositsService.createDeposit(deposit);
      }
     @Post(':id/bring-forward/check')
  async bringForwardCheck(
    @Param('id') id: number,
    @Body() dto: BringForwardDto,
  ) {
    const date = new Date(dto.newReturnDate);
    console.log(date, "date");
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('תאריך לא תקין');
    }
    return this.depositsFlowService.canBringDepositForwardFull(id, date);
  }
}
