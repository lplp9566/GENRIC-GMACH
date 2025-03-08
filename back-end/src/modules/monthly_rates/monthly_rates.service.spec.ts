import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyRatesService } from './monthly_rates.service';

describe('MonthlyRatesService', () => {
  let service: MonthlyRatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonthlyRatesService],
    }).compile();

    service = module.get<MonthlyRatesService>(MonthlyRatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
