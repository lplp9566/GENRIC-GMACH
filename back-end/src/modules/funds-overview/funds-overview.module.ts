import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundsOverviewService } from './funds-overview.service';
import { FundsOverviewController } from './funds-overview.controller';
import { FundsOverviewEntity } from './entity/funds-overview.entity';
import { FundsOverviewViewEntity } from './entity/funds-overview.view.entity';

@Module({
imports: [TypeOrmModule.forFeature([FundsOverviewEntity, FundsOverviewViewEntity])],
  providers: [FundsOverviewService],
  controllers: [FundsOverviewController],
  exports: [FundsOverviewService,TypeOrmModule], 
})
export class FundsOverviewModule {}

