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

@Module({
  imports: [
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
    // AuthModule,

  ],


})
export class AppModule {}
