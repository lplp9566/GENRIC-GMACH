import { forwardRef, Module } from '@nestjs/common';
import { MonthlyDepositsController } from './monthly_deposits.controller';
import { MonthlyDepositsService } from './monthly_deposits.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyDepositsEntity } from './monthly_deposits.entity';
import { use } from 'passport';
import { UsersModule } from '../users/users.module';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { MonthlyRatesModule } from '../monthly_rates/monthly_rates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MonthlyDepositsEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => MonthlyRatesModule),
    UserFinancialsModule,
    FundsOverviewModule
  ],
  controllers: [MonthlyDepositsController],
  providers: [MonthlyDepositsService],
  exports: [MonthlyDepositsService,TypeOrmModule]
})
export class MonthlyDepositsModule {}
