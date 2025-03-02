import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyDepositsService } from './monthly_deposits.service';

describe('MonthlyDepositsService', () => {
  let service: MonthlyDepositsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonthlyDepositsService],
    }).compile();

    service = module.get<MonthlyDepositsService>(MonthlyDepositsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
