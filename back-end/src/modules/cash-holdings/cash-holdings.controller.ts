import { Body, Controller, Post } from '@nestjs/common';
import { CashHoldingsService } from './cash-holdings.service';
import { CashHoldingsEntity } from './Entity/cash-holdings.entity';

@Controller('cash-holdings')
export class CashHoldingsController {
    constructor(
        private readonly cashHoldingsService: CashHoldingsService
    ){}
    @Post ('/initialize')
    async initializeCashHoldings(@Body()cashHoldings:CashHoldingsEntity) {
        return this.cashHoldingsService.createCashHolding(cashHoldings);
    }
    
}
