import { Body, Controller, Post } from '@nestjs/common';
import { CashHoldingsService } from './cash-holdings.service';
import { CashHoldingsEntity } from './Entity/cash-holdings.entity';
import { CashHoldingRequest } from './cash-holdings-dto';

@Controller('cash-holdings')
export class CashHoldingsController {
    constructor(
        private readonly cashHoldingsService: CashHoldingsService
    ){}
    @Post ()
    async initializeCashHoldings(@Body()cashHolding:CashHoldingRequest) {
        return this.cashHoldingsService.cashHolding(cashHolding);
    }
    
}
