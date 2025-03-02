import { Controller } from '@nestjs/common';
import { MonthlyDepositsService } from './monthly_deposits.service';

@Controller('monthly-deposits')
export class MonthlyDepositsController {
    constructor(
        private readonly monthlyDepositsService: MonthlyDepositsService,
    ) {}
    
    
}
