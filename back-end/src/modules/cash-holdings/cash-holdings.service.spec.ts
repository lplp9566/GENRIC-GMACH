import { Test, TestingModule } from '@nestjs/testing';
import { CashHoldingsService } from './cash-holdings.service';

describe('CashHoldingsService', () => {
  let service: CashHoldingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashHoldingsService],
    }).compile();

    service = module.get<CashHoldingsService>(CashHoldingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
