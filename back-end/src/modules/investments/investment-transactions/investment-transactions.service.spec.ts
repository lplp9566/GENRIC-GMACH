import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentTransactionService } from './investment-transactions.service';
import { InvestmentTransactionEntity } from './entity/investment-transaction.entity';

describe('InvestmentTransactionsService', () => {
  let service: InvestmentTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvestmentTransactionService,InvestmentTransactionEntity],
    }).compile();

    service = module.get<InvestmentTransactionService>(InvestmentTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
