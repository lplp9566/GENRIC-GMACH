import { Module } from '@nestjs/common';
import { RoleMonthlyRatesController } from './role_monthly_rates.controller';
import { RoleMonthlyRatesService } from './role_monthly_rates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleMonthlyRateEntity } from './Entity/role_monthly_rates.entity';
import { MembershipRolesModule } from '../membership_roles/membership_roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoleMonthlyRateEntity]),MembershipRolesModule], 
  controllers: [RoleMonthlyRatesController],
  providers: [RoleMonthlyRatesService,TypeOrmModule],
  exports: [RoleMonthlyRatesService,TypeOrmModule],
})
export class RoleMonthlyRatesModule {}
