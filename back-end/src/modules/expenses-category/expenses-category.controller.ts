import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpensesCategoryService } from './expenses-category.service';
import { CreateExpensesCategoryDto } from './dto/create-expenses-category.dto';
import { UpdateExpensesCategoryDto } from './dto/update-expenses-category.dto';

@Controller('expenses-category')
export class ExpensesCategoryController {
  constructor(private readonly expensesCategoryService: ExpensesCategoryService) {}

  @Post()
  create(@Body() createExpensesCategoryDto: CreateExpensesCategoryDto) {
    return this.expensesCategoryService.create(createExpensesCategoryDto);
  }

  @Get()
  findAll() {
    return this.expensesCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesCategoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpensesCategoryDto: UpdateExpensesCategoryDto) {
    return this.expensesCategoryService.update(+id, updateExpensesCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesCategoryService.remove(+id);
  }
}
