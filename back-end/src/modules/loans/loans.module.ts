import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanEntity } from './loans.entity';
import { LoanPaymentEntity } from './loan-actions/loan_actions.entity';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { UserFinancialByYearModule } from '../users/user-financials-by-year/user-financial-by-year.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { UsersModule } from '../users/users.module';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';
import { FundsOverviewByYearModule } from '../funds-overview-by-year/funds-overview-by-year.module';
import { FundsFlowService } from './calcelete.service';
import { MonthlyDepositsModule } from '../monthly_deposits/monthly_deposits.module';
import { MonthlyRatesModule } from '../monthly_rates/monthly_rates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanEntity, LoanPaymentEntity]),
    UserFinancialByYearModule,
    UserFinancialsModule,
    FundsOverviewModule,
    FundsOverviewByYearModule,
    MonthlyDepositsModule,
    MonthlyRatesModule,
    forwardRef(() => UsersModule),
  ],
  providers: [LoansService,FundsFlowService, ],
  controllers: [LoansController],
  exports: [LoansService,FundsFlowService, TypeOrmModule],
})
export class LoansModule {}
