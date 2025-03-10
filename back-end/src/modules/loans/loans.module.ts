import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanEntity } from './loans.entity';
import { LoanPaymentEntity } from './loan-payments/loan_payments.entity';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UserFinancialByYearModule } from '../users/user-financials-by-year/user-financial-by-year.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';

@Module({
  imports: [TypeOrmModule.forFeature([LoanEntity, LoanPaymentEntity,]),  UserFinancialByYearModule,UserFinancialsModule, FundsOverviewModule,UsersModule],
  providers: [LoansService,],
  controllers: [LoansController],
  exports: [LoansService, TypeOrmModule],
})
export class LoansModule {}
