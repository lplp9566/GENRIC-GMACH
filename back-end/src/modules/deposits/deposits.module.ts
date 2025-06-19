import { forwardRef, Module } from '@nestjs/common';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositsActionsEntity } from './deposits-actions/Entity/deposits-actions.entity';
import { UserFinancialByYearModule } from '../users/user-financials-by-year/user-financial-by-year.module';
import { UsersModule } from '../users/users.module';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { FundsOverviewByYearModule } from '../funds-overview-by-year/funds-overview-by-year.module';
import { DepositsEntity } from './Entity/deposits.entity';
import { RoleMonthlyRatesModule } from '../role_monthly_rates/role_monthly_rates.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([DepositsEntity,DepositsActionsEntity]),
    forwardRef(() => UsersModule),
    UserFinancialByYearModule,
    UserFinancialsModule,
    FundsOverviewModule,
    FundsOverviewByYearModule,
    RoleMonthlyRatesModule
  ],
  controllers: [DepositsController],
  providers: [DepositsService],
  exports: [DepositsService],
})
export class DepositsModule {}
