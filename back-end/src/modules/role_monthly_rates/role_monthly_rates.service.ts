import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleMonthlyRateEntity } from './Entity/role_monthly_rates.entity';
import { Repository } from 'typeorm';
class UpdateRoleMonthlyRateDto {
    
    effective_from: Date;
    amount: number
}
@Injectable()
export class RoleMonthlyRatesService {
    constructor(
        @InjectRepository(RoleMonthlyRateEntity)
        private readonly roleMonthlyRatesRepository: Repository<RoleMonthlyRateEntity>,
    ) {}
    async getRoleMonthlyRates(): Promise<RoleMonthlyRateEntity[]> {
        return await this.roleMonthlyRatesRepository.find({relations: ['role']});
    }
    async createRoleMonthlyRate(roleMonthlyRate: RoleMonthlyRateEntity) {
        return await this.roleMonthlyRatesRepository.save(roleMonthlyRate);
    }

  async updateRoleMonthlyRate(
    id: number,
    updateDto: UpdateRoleMonthlyRateDto,
  ): Promise<RoleMonthlyRateEntity> {
    const existing = await this.roleMonthlyRatesRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!existing) {
      throw new NotFoundException('Role monthly rate not found');
    }
    Object.assign(existing, updateDto);

    return await this.roleMonthlyRatesRepository.save(existing);
  }
async deleteRoleMonthlyRate(id: number) {
  try {
    const existing = await this.roleMonthlyRatesRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Role monthly rate not found');
    }

    return await this.roleMonthlyRatesRepository.delete(id);
  } catch (e: any) {
    console.error('deleteRoleMonthlyRate error:', e?.message, e?.code, e?.detail);
    throw e;
  }
}
}

