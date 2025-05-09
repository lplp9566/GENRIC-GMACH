import { Body, Controller, Get, Post } from '@nestjs/common';
import { DepositsActionsService } from './deposits-actions.service';
import { DepositsActionsEntity } from './deposits-actions.entity';
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
    //מחזיר את כל העמודות לפי הטבלה של ההפקדות כלומר כל הפעולות על ההפקדה הספיצפית 
    @Get(':id')
    async getDepositsActionsByDepositId(id: number) {
        return await this.depositsActionsService.getDepositsActionsByDepositId(id);
    }
    @Post()
    async createDepositAction(@Body()depositAction: IDepositAction) {
        return await this.depositsActionsService.createDepositAction(depositAction);
    }

}
