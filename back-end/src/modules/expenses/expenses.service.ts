import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './Entity/expenses.entity';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';
import { getYearFromDate } from '../../services/services';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly fundsOverviewByYearService: FundsOverviewByYearService,
  ) {}

  async create(expenseData: Partial<Expense>): Promise<Expense> {
    const expense = this.expensesRepository.create(expenseData);
    // await this.fundsOverviewService.addExpense(expense.amount);
    const year = getYearFromDate(expense.expenseDate) 
    // await this.fundsOverviewByYearService.recordExpense(year, expense.amount);
    return this.expensesRepository.save(expense);
  }

  async findAll(): Promise<Expense[]> {
    return this.expensesRepository.find({ relations: ['member'] });
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({ where: { id }, relations: ['member'] });
    if (!expense) {
      throw new Error(`Expense with id ${id} not found`);
    }
    return expense;
  }

  async delete(id: number): Promise<void> {
    await this.expensesRepository.delete(id);
  }
}
