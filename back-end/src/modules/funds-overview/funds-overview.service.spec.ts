import { Test, TestingModule } from '@nestjs/testing';
import { FundsOverviewService } from './funds-overview.service';

describe('FundsOverviewService', () => {
  let service: FundsOverviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FundsOverviewService],
    }).compile();

    service = module.get<FundsOverviewService>(FundsOverviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
