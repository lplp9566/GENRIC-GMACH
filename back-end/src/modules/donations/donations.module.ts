import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyDepositsModule } from '../monthly_deposits/monthly_deposits.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { UserFinancialByYearModule } from '../users/user-financials-by-year/user-financial-by-year.module';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';
import { UsersModule } from '../users/users.module';
import { FundsOverviewByYearModule } from '../funds-overview-by-year/funds-overview-by-year.module';
import { DonationsEntity } from './Entity/donations.entity';
import { FundsModule } from '../funds/funds.module';
import { FundYearStatsEntity } from '../funds/Entity/fund-year-stats.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DonationsEntity,
      FundYearStatsEntity
    ]),
    MonthlyDepositsModule,
    UserFinancialByYearModule,
    UsersModule,
    UserFinancialsModule,
    FundsOverviewModule, 
    FundsOverviewByYearModule,
    FundsModule
  ],
  controllers: [DonationsController],
  providers: [
    DonationsService,
  ],
  exports: [DonationsService],
})
export class DonationsModule {}
