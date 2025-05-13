import { Body, Controller, Get, Post } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { DepositsEntity } from './Entity/deposits.entity';


@Controller('deposits')
export class DepositsController {
    constructor(
 private readonly depositsService: DepositsService
    ) {}
    @Get()
    async getDeposits() {
        return await this.depositsService.getDeposits();
      }
      @Get('active')
      async getDepositsActive() {
        return await this.depositsService.getDepositsActive();
      }
      @Get(':id')
      async getDepositById(id: number) {
        return await this.depositsService.getDepositById(id);
      }
      @Post()
      async createDeposit(@Body() deposit: DepositsEntity) {
        return await this.depositsService.createDeposit(deposit);
      }
}
