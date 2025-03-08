import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyRatesEntity } from './monthly_rates.entity';
import { MonthlyRatesService } from './monthly_rates.service';
import { MonthlyDepositsModule } from '../monthly_deposits/monthly_deposits.module';
import { MonthlyRatesController } from './monthly_rates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MonthlyRatesEntity]), forwardRef(() => MonthlyRatesModule)],
   
  controllers: [MonthlyRatesController],
  providers: [MonthlyRatesService],
  exports: [MonthlyRatesService,TypeOrmModule],
})
export class MonthlyRatesModule {}
