import { forwardRef, Module } from '@nestjs/common';
import { RoleMonthlyRatesController } from './role_monthly_rates.controller';
import { RoleMonthlyRatesService } from './role_monthly_rates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleMonthlyRateEntity } from './Entity/role_monthly_rates.entity';
import { MembershipRolesModule } from '../membership_roles/membership_roles.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleMonthlyRateEntity]),
    MembershipRolesModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [RoleMonthlyRatesController],
  providers: [RoleMonthlyRatesService],
  exports: [RoleMonthlyRatesService],
})
export class RoleMonthlyRatesModule {}

