import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from './Entity/expenses.entity';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module'; // ייבוא המודול
import { FundsOverviewByYearModule } from '../funds-overview-by-year/funds-overview-by-year.module';
import { ExpensesCategoryModule } from '../expenses-category/expenses-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]),
    FundsOverviewModule,
    FundsOverviewByYearModule,
    ExpensesCategoryModule
  ],
  providers: [ExpensesService],
  controllers: [ExpensesController],
  exports: [ExpensesService,TypeOrmModule],
})
export class ExpensesModule {}
