import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { Expense } from './Entity/expenses.entity';
import { CreateExpenseDto } from './create-expense.dto';
import { UpdateExpensesDto } from './dto/update-expenses.dto';

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
  @Patch(`:id`)
  async update(@Param(`id`)id:number, @Body()dto:UpdateExpensesDto){
    return this.expensesService.update(id,dto)

  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.expensesService.delete(id);
  }
}
