import { Test, TestingModule } from '@nestjs/testing';
import { UserFinancialByYearService } from './user-financial-by-year.service';

describe('UserFinancialsService', () => {
  let service: UserFinancialByYearService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserFinancialByYearService],
    }).compile();

    service = module.get<UserFinancialByYearService>(UserFinancialByYearService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
