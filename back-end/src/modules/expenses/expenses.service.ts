import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './Entity/expenses.entity';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';
import { getYearFromDate } from '../../services/services';
import { CreateExpenseDto } from './create-expense.dto';
import { UpdateExpensesDto } from './dto/update-expenses.dto';
import { log } from 'util';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly fundsOverviewByYearService: FundsOverviewByYearService,
  ) {}

  async create(expenseData: CreateExpenseDto): Promise<Expense> {
    const { category_id, ...rest } = expenseData;

    const expense = this.expensesRepository.create({
      ...rest,
      category: category_id ? ({ id: category_id } as any) : null,
    });

    return this.expensesRepository.save(expense);
  }

  async findAll(): Promise<Expense[]> {
    return this.expensesRepository.find({});
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
      relations: ['member'],
    });
    if (!expense) {
      throw new Error(`Expense with id ${id} not found`);
    }
    return expense;
  }

  async delete(id: number): Promise<void> {
    await this.expensesRepository.delete(id);
  }
  async update(id: number, data: UpdateExpensesDto) {
    const expense = await this.expensesRepository.findOne({
      where: { id },
    });

    if (!expense)
      throw new NotFoundException(`Expense with id ${id} not found`);

    Object.assign(expense, data);
    const saved = await this.expensesRepository.save(expense);
    return saved;
  }
}
