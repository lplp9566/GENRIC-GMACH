import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesCategoryController } from './expenses-category.controller';
import { ExpensesCategoryService } from './expenses-category.service';

describe('ExpensesCategoryController', () => {
  let controller: ExpensesCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesCategoryController],
      providers: [ExpensesCategoryService],
    }).compile();

    controller = module.get<ExpensesCategoryController>(ExpensesCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
