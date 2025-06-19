import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleMonthlyRateEntity } from './Entity/role_monthly_rates.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleMonthlyRatesService {
    constructor(
        @InjectRepository(RoleMonthlyRateEntity)
        private readonly roleMonthlyRatesRepository: Repository<RoleMonthlyRateEntity>,
    ) {}
    async getRoleMonthlyRates(): Promise<RoleMonthlyRateEntity[]> {
        return await this.roleMonthlyRatesRepository.find();
    }
    async createRoleMonthlyRate(roleMonthlyRate: RoleMonthlyRateEntity) {
        return await this.roleMonthlyRatesRepository.save(roleMonthlyRate);
    }
}
