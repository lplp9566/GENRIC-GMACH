import { forwardRef, Module } from '@nestjs/common';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositsActionsEntity } from './deposits-actions/deposits-actions.entity';
import { UserFinancialByYearModule } from '../users/user-financials-by-year/user-financial-by-year.module';
import { UsersModule } from '../users/users.module';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { MonthlyRatesModule } from '../monthly_rates/monthly_rates.module';
import { FundsOverviewByYearModule } from '../funds-overview-by-year/funds-overview-by-year.module';
import { DepositsEntity } from './deposits.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DepositsEntity,DepositsActionsEntity]),
    forwardRef(() => UsersModule),
    UserFinancialByYearModule,
    UserFinancialsModule,
    FundsOverviewModule,
    MonthlyRatesModule,
    FundsOverviewByYearModule,
  ],
  controllers: [DepositsController],
  providers: [DepositsService],
  exports: [DepositsService],
})
export class DepositsModule {}
