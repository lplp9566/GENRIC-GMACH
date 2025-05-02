import { Module } from '@nestjs/common';
import { CashHoldingsController } from './cash-holdings.controller';
import { CashHoldingsService } from './cash-holdings.service';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashHoldingsEntity } from './Entity/cash-holdings.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
        TypeOrmModule.forFeature([CashHoldingsEntity]),
    UserFinancialsModule,FundsOverviewModule,UsersModule],
  controllers: [CashHoldingsController],
  providers: [CashHoldingsService],
  exports: [CashHoldingsService,TypeOrmModule],
})
export class CashHoldingsModule {}
