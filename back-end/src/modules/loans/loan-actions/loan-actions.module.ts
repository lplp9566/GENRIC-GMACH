import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanPaymentEntity } from './loan_actions.entity';
import { UserFinancialByYearModule } from 'src/modules/users/user-financials-by-year/user-financial-by-year.module';
import { UserFinancialsModule } from 'src/modules/users/user-financials/user-financials.module';
import { FundsOverviewModule } from 'src/modules/funds-overview/funds-overview.module';
import { UsersModule } from 'src/modules/users/users.module';
import { LoanActionsService } from './loan_actions.service';
import { LoanEntity } from '../loans.entity';
import { LoansModule } from '../loans.module';
import { PaymentDetailsModule } from 'src/modules/users/payment-details/payment-details.module';
import { LoanActionsController } from './loan_actions.controller';
// cSpell:ignore Financials

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanPaymentEntity, LoanEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() =>  PaymentDetailsModule,),
    forwardRef(() => UsersModule),
    LoansModule,
    UserFinancialByYearModule,
    UserFinancialsModule,
    FundsOverviewModule,
   
  ],
  providers: [LoanActionsService],
  controllers: [LoanActionsController],
  exports: [LoanActionsService, TypeOrmModule],
})
export class LoanPaymentsModule {}
