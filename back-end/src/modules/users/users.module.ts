import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { PaymentDetailsModule } from './payment-details/payment-details.module';
import { UserBalanceCronService } from './user-balance-cron.service';
import { MonthlyDepositsModule } from '../monthly_deposits/monthly_deposits.module';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { UserFinancialsModule } from './user-financials/user-financials.module';
import { RequestsModule } from '../requests/requests.module';
import { LoanActionsModule } from '../loans/loan-actions/loan-actions.module';
import { UserRoleHistoryModule } from '../user_role_history/user_role_history.module';
import { MembershipRolesModule } from '../membership_roles/membership_roles.module';
import { RoleMonthlyRatesModule } from '../role_monthly_rates/role_monthly_rates.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { RoleMonthlyRateEntity } from '../role_monthly_rates/Entity/role_monthly_rates.entity';

@Module({
  imports: [

TypeOrmModule.forFeature([
  UserEntity,
  PaymentDetailsEntity,
  RoleMonthlyRateEntity,
]),    forwardRef(() => MonthlyDepositsModule),
    forwardRef(() => LoanActionsModule),
    forwardRef(() => RequestsModule),
    forwardRef(() => UserRoleHistoryModule),
    forwardRef(() => MembershipRolesModule),
    forwardRef(() => WhatsappModule),
    forwardRef(() => RoleMonthlyRatesModule),

    PaymentDetailsModule,
    UserFinancialsModule,

  ],
  controllers: [UsersController],
  providers: [UsersService, UserBalanceCronService],
  exports: [UsersService, UserBalanceCronService, TypeOrmModule],
})
export class UsersModule {}
