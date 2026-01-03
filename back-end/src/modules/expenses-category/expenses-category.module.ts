import { Module } from '@nestjs/common';
import { ExpensesCategoryService } from './expenses-category.service';
import { ExpensesCategoryController } from './expenses-category.controller';
import { ExpensesModule } from '../expenses/expenses.module';
import { ExpensesCategory } from './entities/expenses-category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ TypeOrmModule.forFeature([ExpensesCategory])],
  controllers: [ExpensesCategoryController],
  providers: [ExpensesCategoryService],
  exports: [ExpensesCategoryService,TypeOrmModule],
})
export class ExpensesCategoryModule {}
