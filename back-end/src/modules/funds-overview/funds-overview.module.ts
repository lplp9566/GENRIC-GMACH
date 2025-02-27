import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundsOverviewService } from './funds-overview.service';
import { FundsOverviewController } from './funds-overview.controller';
import { FundsOverviewEntity } from './funds-overview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FundsOverviewEntity])],
  providers: [FundsOverviewService],
  controllers: [FundsOverviewController],
  exports: [FundsOverviewService], // חשוב לייצא כדי שמודולים אחרים יוכלו להשתמש בזה
})
export class FundsOverviewModule {}
