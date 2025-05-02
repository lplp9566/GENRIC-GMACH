import { Test, TestingModule } from '@nestjs/testing';
import { CashHoldingsController } from './cash-holdings.controller';

describe('CashHoldingsController', () => {
  let controller: CashHoldingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashHoldingsController],
    }).compile();

    controller = module.get<CashHoldingsController>(CashHoldingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
