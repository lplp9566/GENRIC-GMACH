import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoleMonthlyRatesService } from './role_monthly_rates.service';
import { RoleMonthlyRateEntity } from './Entity/role_monthly_rates.entity';

@Controller('role-monthly-rates')
export class RoleMonthlyRatesController {
    constructor(
        private readonly roleMonthlyRatesService: RoleMonthlyRatesService
    ) {}
    @Get()
    async getRoleMonthlyRates() {
        return await this.roleMonthlyRatesService.getRoleMonthlyRates();
    }
    @Post()
    async createRoleMonthlyRate( @Body() roleMonthlyRate: RoleMonthlyRateEntity) {
        return await this.roleMonthlyRatesService.createRoleMonthlyRate(roleMonthlyRate);
    }
}
