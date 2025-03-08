import { Module } from '@nestjs/common';
import { UserFinancialsController } from './user-financials.controller';
import { UserFinancialsService } from './user-financials.service';
import { UserFinancialsEntity } from './user-financials.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyRatesModule } from 'src/modules/monthly_rates/monthly_rates.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserFinancialsEntity]),MonthlyRatesModule],
  controllers: [UserFinancialsController],
  providers: [UserFinancialsService],
  exports: [UserFinancialsService,TypeOrmModule],
  

})
export class UserFinancialsModule {}
