import { Test, TestingModule } from '@nestjs/testing';
import { FundsOverviewByYearService } from './funds-overview-by-year.service';

describe('FundsOverviewByYearService', () => {
  let service: FundsOverviewByYearService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: FundsOverviewByYearService, useValue: {} }],
    }).compile();

    service = module.get<FundsOverviewByYearService>(FundsOverviewByYearService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
