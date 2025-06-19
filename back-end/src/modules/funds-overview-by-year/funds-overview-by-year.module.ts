import { Module } from '@nestjs/common';
import { FundsOverviewByYearController } from './funds-overview-by-year.controller';
import { FundsOverviewByYearService } from './funds-overview-by-year.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundsOverviewByYearEntity } from './Entity/funds-overview-by-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FundsOverviewByYearEntity]),
  
],
  controllers: [FundsOverviewByYearController],
  providers: [FundsOverviewByYearService],
  exports: [FundsOverviewByYearService, TypeOrmModule],
})
export class FundsOverviewByYearModule {}
