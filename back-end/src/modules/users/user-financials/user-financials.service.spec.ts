import { Test, TestingModule } from '@nestjs/testing';
import { UserFinancialService } from './user-financials.service';

describe('UserFinancialService', () => {
  let service: UserFinancialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: UserFinancialService, useValue: {} }],
    }).compile();

    service = module.get<UserFinancialService>(UserFinancialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
