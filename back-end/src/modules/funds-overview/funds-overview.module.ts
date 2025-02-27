import { Module } from '@nestjs/common';
import { FundsOverviewService } from './funds-overview.service';
import { FundsOverviewController } from './funds-overview.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundsOverviewEntity } from './funds-overview.entity';

@Module({
     providers: [FundsOverviewService],
     controllers: [FundsOverviewController],
     imports: [TypeOrmModule.forFeature([FundsOverviewEntity])],
     exports: [FundsOverviewService]
})
export class FundsOverviewModule {}
