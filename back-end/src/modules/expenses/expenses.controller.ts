import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { Expense } from './Entity/expenses.entity';
import { CreateExpenseDto } from './create-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

@Post()
async create(@Body() dto: CreateExpenseDto): Promise<Expense> {
  return this.expensesService.create(dto);
}


  @Get()
  async findAll(): Promise<Expense[]> {
    return this.expensesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Expense> {
    return this.expensesService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.expensesService.delete(id);
  }
}
