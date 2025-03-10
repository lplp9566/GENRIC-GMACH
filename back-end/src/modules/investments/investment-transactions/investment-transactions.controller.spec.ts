import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentTransactionController } from './investment-transactions.controller';

describe('InvestmentTransactionsController', () => {
  let controller: InvestmentTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestmentTransactionController],
    }).compile();

    controller = module.get<InvestmentTransactionController>(InvestmentTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
