import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanEntity } from './loans.entity';
import { LoanPaymentEntity } from './loan-payments/loan_payments.entity';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';

@Module({
  imports: [TypeOrmModule.forFeature([LoanEntity, LoanPaymentEntity,]),  UserFinancialsModule,FundsOverviewModule],
  providers: [LoansService, UserFinancialsService, FundsOverviewService],
  controllers: [LoansController],
  exports: [LoansService, TypeOrmModule],
})
export class LoansModule {}
