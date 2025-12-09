import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
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
    @Patch(':id')
    async updateRoleMonthlyRate(@Body() updateDto: RoleMonthlyRateEntity) {
        return await this.roleMonthlyRatesService.updateRoleMonthlyRate(updateDto.id, updateDto);
    }
    @Delete(':id')
    async deleteRoleMonthlyRate(@Param('id') id: number) {
        return await this.roleMonthlyRatesService.deleteRoleMonthlyRate(id);
    }
}
