import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsEntity } from './donations.entity';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/user.entity';
import { PaymentDetailsEntity } from '../users/payment-details/payment_details.entity';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UserFinancialByYearEntity } from '../users/user-financials-by-year/user-financial-by-year.entity';
import { FundsOverviewEntity } from '../funds-overview/entity/funds-overview.entity';
import { MonthlyDepositsModule } from '../monthly_deposits/monthly_deposits.module';
import { MonthlyRatesModule } from '../monthly_rates/monthly_rates.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { UserFinancialByYearModule } from '../users/user-financials-by-year/user-financial-by-year.module';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DonationsEntity,
      
    ]),
    MonthlyDepositsModule,
    UserFinancialByYearModule,
    UsersModule,
    UserFinancialsModule,
    FundsOverviewModule, 
    MonthlyRatesModule
  ],
  controllers: [DonationsController],
  providers: [
    DonationsService,
  ],
  exports: [DonationsService],
})
export class DonationsModule {}
