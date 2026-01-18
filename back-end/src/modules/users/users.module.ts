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
import { MailModule } from '../mail/mail.module';
import { UserFinancialByYearModule } from './user-financials-by-year/user-financial-by-year.module';
import { OrderReturnEntity } from '../order-return/Entity/order-return.entity';

@Module({
  imports: [

TypeOrmModule.forFeature([
  UserEntity,
  PaymentDetailsEntity,
  RoleMonthlyRateEntity,
  OrderReturnEntity,
]),    forwardRef(() => MonthlyDepositsModule),
    forwardRef(() => LoanActionsModule),
    forwardRef(() => RequestsModule),
    forwardRef(() => UserRoleHistoryModule),
    forwardRef(() => MembershipRolesModule),
    forwardRef(() => WhatsappModule),
    forwardRef(() => RoleMonthlyRatesModule),
    MailModule,
    PaymentDetailsModule,
    UserFinancialsModule,
    UserFinancialByYearModule
  ],
  controllers: [UsersController],
  providers: [UsersService, UserBalanceCronService],
  exports: [UsersService, UserBalanceCronService, TypeOrmModule],
})
export class UsersModule {}
