import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyDepositsController } from './monthly_deposits.controller';

describe('MonthlyDepositsController', () => {
  let controller: MonthlyDepositsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonthlyDepositsController],
    }).compile();

    controller = module.get<MonthlyDepositsController>(MonthlyDepositsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
