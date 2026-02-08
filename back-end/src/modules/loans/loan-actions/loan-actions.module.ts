import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanActionEntity } from './Entity/loan_actions.entity';
import { UserFinancialsModule } from '../../users/user-financials/user-financials.module';
import { FundsOverviewModule } from '../../funds-overview/funds-overview.module';
import { UsersModule } from '../../users/users.module';
import { LoanActionsService } from './loan_actions.service';
import { LoanEntity } from '../Entity/loans.entity';
import { LoansModule } from '../loans.module';
import { PaymentDetailsModule } from '../../users/payment-details/payment-details.module';
import { LoanActionsController } from './loan_actions.controller';
import { UserFinancialByYearModule } from '../../users/user-financials-by-year/user-financial-by-year.module';
import { FundsOverviewByYearModule } from '../../funds-overview-by-year/funds-overview-by-year.module';
import { LoanActionBalanceService } from './loan_action_balance.service';
import { MailModule } from '../../mail/mail.module';
// cSpell:ignore Financials

@Module({
  imports: [
    TypeOrmModule.forFeature([LoanActionEntity, LoanEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() =>  PaymentDetailsModule,),
    forwardRef(() => UsersModule),
    forwardRef(() => LoansModule),
    UserFinancialsModule,
    UserFinancialByYearModule,
    FundsOverviewModule,
    FundsOverviewByYearModule,
    MailModule,
   
  ],
  providers: [LoanActionsService,LoanActionBalanceService],
  controllers: [LoanActionsController],
  exports: [LoanActionsService,LoanActionBalanceService,  TypeOrmModule,],
})
export class LoanActionsModule {}
