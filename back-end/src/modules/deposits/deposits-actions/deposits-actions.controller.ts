import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DepositsActionsService } from './deposits-actions.service';
import { DepositsActionsEntity } from './Entity/deposits-actions.entity';
import { IDepositAction } from './depostits-actions-dto';

@Controller('deposits-actions')
export class DepositsActionsController {
    constructor(
        private readonly depositsActionsService: DepositsActionsService
    ) {}

    @Get()
    async getDepositsActions() {
        return await this.depositsActionsService.getDepositsActions();
    }
  @Get(':id')
  async getDepositsActionsByDepositId(@Param('id', ParseIntPipe) id: number) {
    return this.depositsActionsService.getDepositsActionsByDepositId(id);
  }
    @Post()
    async createDepositAction(@Body()depositAction: IDepositAction) {
        return await this.depositsActionsService.createDepositAction(depositAction);
    }

}
