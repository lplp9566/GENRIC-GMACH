import { Test, TestingModule } from '@nestjs/testing';
import { LoanActionBalanceService } from './loan_action_balance.service';

describe('LoanActionBalanceService', () => {
  let service: LoanActionBalanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: LoanActionBalanceService, useValue: {} }],
    }).compile();

    service = module.get<LoanActionBalanceService>(LoanActionBalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
