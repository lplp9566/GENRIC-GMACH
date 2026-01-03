import { Injectable } from '@nestjs/common';
import { CreateExpensesCategoryDto } from './dto/create-expenses-category.dto';
import { UpdateExpensesCategoryDto } from './dto/update-expenses-category.dto';
import { ExpensesCategory } from './entities/expenses-category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ExpensesCategoryService {
  constructor(
    @InjectRepository(ExpensesCategory)
    private readonly expensesCategoryRepository: Repository<ExpensesCategory>,
  ) {}
  create(createExpensesCategoryDto: CreateExpensesCategoryDto) {
    return this.expensesCategoryRepository.save(createExpensesCategoryDto);
  }

  findAll() {
    return `This action returns all expensesCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expensesCategory`;
  }

  update( id: number, updateExpensesCategoryDto: UpdateExpensesCategoryDto) {
    return this.expensesCategoryRepository.update(id, {name: updateExpensesCategoryDto.name});
  }

  remove(id: number) {
    return this.expensesCategoryRepository.delete(id);
  }
}
