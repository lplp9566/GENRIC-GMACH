// cSpell:ignore Financials

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
// import { AuthModule } from './auth/auth.module';
import { FundsOverviewModule } from './modules/funds-overview/funds-overview.module';
import { FundsOverviewService } from './modules/funds-overview/funds-overview.service';
import { FundsOverviewController } from './modules/funds-overview/funds-overview.controller';
import { LoanPaymentsModule } from './modules/loans/loan-actions/loan-actions.module';
import { LoansController } from './modules/loans/loans.controller';
import { LoansService } from './modules/loans/loans.service';
import { LoansModule } from './modules/loans/loans.module';
import { UserFinancialByYearModule } from './modules/users/user-financials-by-year/user-financial-by-year.module';
import { ExpensesService } from './modules/expenses/expenses.service';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { PaymentDetailsModule } from './modules/users/payment-details/payment-details.module';
import { MonthlyDepositsModule } from './modules/monthly_deposits/monthly_deposits.module';
import { DonationsModule } from './modules/donations/donations.module';
import { MonthlyRatesModule } from './modules/monthly_rates/monthly_rates.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './modules/mail/mail.module';
import { UserFinancialsModule } from './modules/users/user-financials/user-financials.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { InvestmentTransactionsModule } from './modules/investments/investment-transactions/investment-transactions.module';
import { config } from 'dotenv';
import { RequestsModule } from './modules/requests/requests.module';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false } 
          : false, // ללא SSL בלוקאלי
      }),
    }),
    
    
    UsersModule,
    LoansModule,
    LoanPaymentsModule,
    FundsOverviewModule,
    UserFinancialByYearModule,
    ExpensesModule,
    PaymentDetailsModule,
    MonthlyDepositsModule,
    DonationsModule,
    MonthlyRatesModule,
    MailModule,
    UserFinancialsModule,
    InvestmentsModule, 
    InvestmentTransactionsModule, RequestsModule
    // AuthModule,

  ],
  providers: [ExpensesService],



})
export class AppModule {}
