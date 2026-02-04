import { Test, TestingModule } from '@nestjs/testing';
import { RoleMonthlyRatesService } from './role_monthly_rates.service';

describe('RoleMonthlyRatesService', () => {
  let service: RoleMonthlyRatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: RoleMonthlyRatesService, useValue: {} }],
    }).compile();

    service = module.get<RoleMonthlyRatesService>(RoleMonthlyRatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
