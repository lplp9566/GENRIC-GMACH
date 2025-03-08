import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsEntity } from './donations.entity';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/user.entity';
import { PaymentDetailsEntity } from '../users/payment-details/payment_details.entity';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UserFinancialsEntity } from '../users/user-financials/user-financials.entity';
import { FundsOverviewEntity } from '../funds-overview/funds-overview.entity';
import { MonthlyDepositsModule } from '../monthly_deposits/monthly_deposits.module';
import { MonthlyRatesModule } from '../monthly_rates/monthly_rates.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DonationsEntity,
      UserEntity,
      PaymentDetailsEntity,
    ]),
    MonthlyDepositsModule,
    UserFinancialsModule,
    FundsOverviewModule, 
    MonthlyRatesModule
  ],
  controllers: [DonationsController],
  providers: [
    DonationsService,
    UsersService,
    UserFinancialsService,
    FundsOverviewService,
  ],
  exports: [DonationsService],
})
export class DonationsModule {}
