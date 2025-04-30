import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanPaymentEntity } from './loan_actions.entity';
import { UserFinancialsModule } from '../../users/user-financials/user-financials.module';
import { FundsOverviewModule } from '../../funds-overview/funds-overview.module';
import { UsersModule } from '../../users/users.module';
import { LoanActionsService } from './loan_actions.service';
import { LoanEntity } from '../loans.entity';
import { LoansModule } from '../loans.module';
import { PaymentDetailsModule } from '../../users/payment-details/payment-details.module';
import { LoanActionsController } from './loan_actions.controller';
import { UserFinancialByYearModule } from '../../users/user-financials-by-year/user-financial-by-year.module';
// cSpell:ignore Financials

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanPaymentEntity, LoanEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() =>  PaymentDetailsModule,),
    forwardRef(() => UsersModule),
    LoansModule,
    UserFinancialsModule,
    UserFinancialByYearModule,
    FundsOverviewModule,
   
  ],
  providers: [LoanActionsService],
  controllers: [LoanActionsController],
  exports: [LoanActionsService, TypeOrmModule],
})
export class LoanPaymentsModule {}
