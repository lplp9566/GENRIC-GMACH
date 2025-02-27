import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from './expenses.entity';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module'; // ייבוא המודול

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]),
    FundsOverviewModule, 
  ],
  providers: [ExpensesService],
  controllers: [ExpensesController],
  exports: [ExpensesService,TypeOrmModule],
})
export class ExpensesModule {}
