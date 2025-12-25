
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { FundsOverviewModule } from './modules/funds-overview/funds-overview.module';
import { LoanActionsModule } from './modules/loans/loan-actions/loan-actions.module';
import { LoansModule } from './modules/loans/loans.module';
import { UserFinancialByYearModule } from './modules/users/user-financials-by-year/user-financial-by-year.module';
import { ExpensesService } from './modules/expenses/expenses.service';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { PaymentDetailsModule } from './modules/users/payment-details/payment-details.module';
import { MonthlyDepositsModule } from './modules/monthly_deposits/monthly_deposits.module';
import { DonationsModule } from './modules/donations/donations.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './modules/mail/mail.module';
import { UserFinancialsModule } from './modules/users/user-financials/user-financials.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { InvestmentTransactionsModule } from './modules/investments/investment-transactions/investment-transactions.module';
import { RequestsModule } from './modules/requests/requests.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepositsModule } from './modules/deposits/deposits.module';
import { CashHoldingsModule } from './modules/cash-holdings/cash-holdings.module';
import { OrderReturnModule } from './modules/order-return/order-return.module';
import { FundsOverviewByYearModule } from './modules/funds-overview-by-year/funds-overview-by-year.module';
import { DepositsActionsModule } from './modules/deposits/deposits-actions/deposits-actions.module';
import { RegulationModule } from './modules/regulation/regulation.module';
import { MembershipRolesModule } from './modules/membership_roles/membership_roles.module';
import { RoleMonthlyRatesModule } from './modules/role_monthly_rates/role_monthly_rates.module';
import { UserRoleHistoryService } from './modules/user_role_history/user_role_history.service';
import { UserRoleHistoryController } from './modules/user_role_history/user_role_history.controller';
import { UserRoleHistoryModule } from './modules/user_role_history/user_role_history.module';

import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { FundsModule } from './modules/funds/funds.module';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
         synchronize: true,  
           migrationsRun: false,         // ✅ יריץ migrations אוטומטית בעלייה
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
        ssl: process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false } 
          : false, // ללא SSL בלוקאלי
      }),
    }),
    
    
    UsersModule,
    LoansModule,
    LoanActionsModule,
    FundsOverviewModule,
    UserFinancialByYearModule,
    ExpensesModule,
    PaymentDetailsModule,
    MonthlyDepositsModule,
    DonationsModule,
    MailModule,
    UserFinancialsModule,
    InvestmentsModule, 
    InvestmentTransactionsModule, RequestsModule,
    AuthModule,
    DepositsModule,
    DepositsActionsModule,
    CashHoldingsModule,
    OrderReturnModule,
    FundsOverviewByYearModule,
    RegulationModule,
    MembershipRolesModule,
    RoleMonthlyRatesModule,
    UserRoleHistoryModule,
    WhatsappModule,
    FundsModule,
  ],
  providers: [ExpensesService, UserRoleHistoryService],
  controllers: [UserRoleHistoryController,],



})
export class AppModule {}
