import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleMonthlyRateEntity } from './Entity/role_monthly_rates.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
class UpdateRoleMonthlyRateDto {
  effective_from: Date;
  amount: number;
}
@Injectable()
export class RoleMonthlyRatesService {
  constructor(
    @InjectRepository(RoleMonthlyRateEntity)
    private readonly roleMonthlyRatesRepository: Repository<RoleMonthlyRateEntity>,
    private readonly usersService: UsersService,
  ) {}
  async getRoleMonthlyRates(): Promise<RoleMonthlyRateEntity[]> {
    return await this.roleMonthlyRatesRepository.find({ relations: ['role'] });
  }
  async createRoleMonthlyRate(roleMonthlyRate: RoleMonthlyRateEntity) {
    const result = await this.roleMonthlyRatesRepository.save(roleMonthlyRate);
    const users = await this.usersService.getAllUsers();
    for (const user of users!) {
      const net = await this.usersService.updateUserMonthlyBalance(user);
    }

    return result;
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

    const result = await this.roleMonthlyRatesRepository.save(existing);
    const users = await this.usersService.getAllUsers();
    for (const user of users!) {
      const net = await this.usersService.updateUserMonthlyBalance(user);
    }

    return result;
  }
  async deleteRoleMonthlyRate(id: number) {
    try {
      const existing = await this.roleMonthlyRatesRepository.findOne({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException('Role monthly rate not found');
      }


      const result = await this.roleMonthlyRatesRepository.delete(id);
            const users = await this.usersService.getAllUsers();
      for (const user of users!) {
        const net = await this.usersService.updateUserMonthlyBalance(user);
      }

      return result;

    } catch (e: any) {
      console.error(
        'deleteRoleMonthlyRate error:',
        e?.message,
        e?.code,
        e?.detail,
      );
      throw e;
    }
  }
}
