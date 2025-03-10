import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentTransactionService } from './investment-transactions.service';

describe('InvestmentTransactionsService', () => {
  let service: InvestmentTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvestmentTransactionService],
    }).compile();

    service = module.get<InvestmentTransactionService>(InvestmentTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
