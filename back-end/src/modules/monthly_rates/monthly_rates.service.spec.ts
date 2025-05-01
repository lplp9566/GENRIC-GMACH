import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyRatesService } from './monthly_rates.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyRatesEntity } from './monthly_rates.entity';
import { UserRole } from '../users/userTypes';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  })),
});

describe('MonthlyRatesService', () => {
  let service: MonthlyRatesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonthlyRatesService,
        {
          provide: getRepositoryToken(MonthlyRatesEntity),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get<MonthlyRatesService>(MonthlyRatesService);
    repo = module.get(getRepositoryToken(MonthlyRatesEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllRates', () => {
    it('should return all rates', async () => {
      const mockRates = [{ id: 1, year: 2025, month: 5, role: UserRole.committeeMember, amount: 100 }];
      repo.find.mockResolvedValue(mockRates);
      const result = await service.getAllRates();
      expect(result).toEqual(mockRates);
    });
  });


  describe('addRate', () => {
    it('should add a new rate if not existing', async () => {
      const newRate = { year: 2025, month: 6, role: UserRole.committeeMember, amount: 120 } as MonthlyRatesEntity;
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(newRate);
      repo.save.mockResolvedValue(newRate);

      const result = await service.addRate(newRate);
      expect(result).toEqual(newRate);
      expect(repo.save).toHaveBeenCalledWith(newRate);
    });

    it('should throw error if rate exists', async () => {
      const existingRate = { id: 99, year: 2025, month: 6, role: UserRole.committeeMember, amount: 120 } as MonthlyRatesEntity;
      repo.findOne.mockResolvedValue(existingRate);

      await expect(service.addRate(existingRate)).rejects.toThrow('Rate already exist');
    });
  });
});
