// src/role_monthly_rates/role_monthly_rates.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoleMonthlyRatesService } from './role_monthly_rates.service';
import { RoleMonthlyRateEntity } from './Entity/role_monthly_rates.entity';

describe('RoleMonthlyRatesService', () => {
  let service: RoleMonthlyRatesService;
  let repo: jest.Mocked<Repository<RoleMonthlyRateEntity>>;

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleMonthlyRatesService,
        {
          provide: getRepositoryToken(RoleMonthlyRateEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<RoleMonthlyRatesService>(RoleMonthlyRatesService);
    repo = module.get(getRepositoryToken(RoleMonthlyRateEntity));
  });

  describe('getRoleMonthlyRates', () => {
    it('should return an array of rates', async () => {
      const rates: RoleMonthlyRateEntity[] = [
        { id: 1, role: { id: 10, name: 'Gold' }, effective_from: new Date('2025-01-01'), amount: 100 },
        { id: 2, role: { id: 20, name: 'Silver' }, effective_from: new Date('2025-02-01'), amount: 80 },
      ] as any;
      repo.find.mockResolvedValue(rates);

      const result = await service.getRoleMonthlyRates();
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(rates);
    });
  });

  describe('createRoleMonthlyRate', () => {
    it('should save and return the new rate entity', async () => {
      const dto: RoleMonthlyRateEntity = {
        id: 1,
        role: { id: 10, name: 'Gold' } as any,
        effective_from: new Date('2025-03-01'),
        amount: 120,
      };
      const saved: RoleMonthlyRateEntity = { ...dto, id: 3 };
      repo.save.mockResolvedValue(saved);

      const result = await service.createRoleMonthlyRate(dto);
      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(saved);
    });
  });
});
