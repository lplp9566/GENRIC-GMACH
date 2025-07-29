import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanEntity } from './Entity/loans.entity';
import { LoanActionEntity } from './loan-actions/Entity/loan_actions.entity';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { UserFinancialByYearModule } from '../users/user-financials-by-year/user-financial-by-year.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { UsersModule } from '../users/users.module';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';
import { FundsOverviewByYearModule } from '../funds-overview-by-year/funds-overview-by-year.module';
import { FundsFlowService } from './calcelete.service';
import { MonthlyDepositsModule } from '../monthly_deposits/monthly_deposits.module';
import { DepositsModule } from '../deposits/deposits.module';
import { RoleMonthlyRatesModule } from '../role_monthly_rates/role_monthly_rates.module';
import { PaymentDetailsModule } from '../users/payment-details/payment-details.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanEntity, LoanActionEntity]),
    UserFinancialByYearModule,
    UserFinancialsModule,
    FundsOverviewModule,
    FundsOverviewByYearModule,
    MonthlyDepositsModule,
    DepositsModule,
    RoleMonthlyRatesModule,
    PaymentDetailsModule,
    forwardRef(() => UsersModule),
  ],
  providers: [LoansService,FundsFlowService, ],
  controllers: [LoansController],
  exports: [LoansService,FundsFlowService, TypeOrmModule],
})
export class LoansModule {}
