import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
// import { AuthModule } from './auth/auth.module';
import { FundsOverviewModule } from './modules/funds-overview/funds-overview.module';
import { FundsOverviewService } from './modules/funds-overview/funds-overview.service';
import { FundsOverviewController } from './modules/funds-overview/funds-overview.controller';
import { LoanPaymentsModule } from './modules/loans/loan-payments/loan-payments.module';
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

@Module({
  imports: [
    // ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // לשימוש בפיתוח בלבד!
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
    // AuthModule,

  ],
  providers: [ExpensesService],


})
export class AppModule {}
