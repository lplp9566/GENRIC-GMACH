import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanPaymentEntity } from './loan_payments.entity';
import { UserFinancialByYearModule } from 'src/modules/users/user-financials-by-year/user-financial-by-year.module';
import { UserFinancialsModule } from 'src/modules/users/user-financials/user-financials.module';
import { FundsOverviewModule } from 'src/modules/funds-overview/funds-overview.module';
import { UsersModule } from 'src/modules/users/users.module';
import { LoanPaymentsService } from './loan_payments.service';
import { LoanPaymentsController } from './loan_payments.controller';
import { LoanEntity } from '../loans.entity';
import { LoansModule } from '../loans.module';
import { PaymentDetailsModule } from 'src/modules/users/payment-details/payment-details.module';
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
  providers: [LoanPaymentsService],
  controllers: [LoanPaymentsController],
  exports: [LoanPaymentsService, TypeOrmModule],
})
export class LoanPaymentsModule {}
