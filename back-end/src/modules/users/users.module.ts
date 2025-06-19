import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { PaymentDetailsModule } from './payment-details/payment-details.module';
import { UserBalanceCronService } from './user-balance-cron.service';
import { MonthlyDepositsModule } from '../monthly_deposits/monthly_deposits.module';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { MonthlyRatesModule } from '../monthly_rates/monthly_rates.module';
import { UserFinancialsModule } from './user-financials/user-financials.module';
import { RequestsModule } from '../requests/requests.module';
import { LoanActionsModule } from '../loans/loan-actions/loan-actions.module';
import { UserRoleHistoryModule } from '../user_role_history/user_role_history.module';
import { MembershipRolesModule } from '../membership_roles/membership_roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, PaymentDetailsEntity]),
    forwardRef(() => MonthlyDepositsModule),
    forwardRef(() => MonthlyRatesModule),
    forwardRef(() => LoanActionsModule),
    forwardRef(() => RequestsModule),
    forwardRef(() => UserRoleHistoryModule),
    forwardRef(() => MembershipRolesModule),
    PaymentDetailsModule,
    // cSpell:ignore Financials
    UserFinancialsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserBalanceCronService],
  exports: [UsersService, UserBalanceCronService, TypeOrmModule],
})
export class UsersModule {}
