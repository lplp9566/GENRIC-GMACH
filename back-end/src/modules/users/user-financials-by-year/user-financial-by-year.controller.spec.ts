import { Test, TestingModule } from '@nestjs/testing';
import { UserFinancialByYearController as UserFinancialByYearController } from './user-financials-by-year.controller';

describe('UserFinancialsController', () => {
  let controller: UserFinancialByYearController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFinancialByYearController],
    }).compile();

    controller = module.get<UserFinancialByYearController>(UserFinancialByYearController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
