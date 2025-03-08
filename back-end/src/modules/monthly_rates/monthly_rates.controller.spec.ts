import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyRatesController } from './monthly_rates.controller';

describe('MonthlyRatesController', () => {
  let controller: MonthlyRatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonthlyRatesController],
    }).compile();

    controller = module.get<MonthlyRatesController>(MonthlyRatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
