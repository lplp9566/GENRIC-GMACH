import { Module } from '@nestjs/common';
import { MonthlyDepositsController } from './monthly_deposits.controller';
import { MonthlyDepositsService } from './monthly_deposits.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyDepositsEntity } from './monthle_deposits.entity';
import { UserDebtsEntity } from '../users/user_debts/user_debts.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([MonthlyDepositsEntity,UserDebtsEntity])],
  controllers: [MonthlyDepositsController],
  providers: [MonthlyDepositsService],
  exports:[MonthlyDepositsService,TypeOrmModule]
})
export class MonthlyDepositsModule {}
