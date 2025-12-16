import { Module } from '@nestjs/common';
import { FundsService } from './funds.service';
import { FundsController } from './funds.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundEntity } from './Entity/funds.entity';
import { FundYearStatsEntity } from './Entity/fund-year-stats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FundEntity,FundYearStatsEntity])],
  providers: [FundsService],
  controllers: [FundsController],
  exports: [FundsService],
})
export class FundsModule {}
