import { Test, TestingModule } from '@nestjs/testing';
import { CashHoldingsService } from './cash-holdings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CashHoldingsEntity } from './Entity/cash-holdings.entity';
import { UsersService } from '../users/users.service';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { Repository } from 'typeorm';
import { CashHoldingsTypesRecordType } from './cash-holdings-dto';

const mockCashHoldingsRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockUsersService = () => ({
  getUserById: jest.fn(),
});

const mockUserFinancialsService = () => ({
  recordCashHoldings: jest.fn(),
});

const mockFundsOverviewService = () => ({
  recordCashHoldings: jest.fn(),
});

describe('CashHoldingsService', () => {
  let service: CashHoldingsService;
  let repo: Repository<CashHoldingsEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashHoldingsService,
        { provide: getRepositoryToken(CashHoldingsEntity), useFactory: mockCashHoldingsRepository },
        { provide: UsersService, useFactory: mockUsersService },
        { provide: UserFinancialsService, useFactory: mockUserFinancialsService },
        { provide: FundsOverviewService, useFactory: mockFundsOverviewService },
      ],
    }).compile();

    service = module.get<CashHoldingsService>(CashHoldingsService);
    repo = module.get<Repository<CashHoldingsEntity>>(getRepositoryToken(CashHoldingsEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCashHoldings', () => {
    it('should return all cash holdings', async () => {
      const mockResult = [{ id: 1, amount: 100 }];
      jest.spyOn(repo, 'find').mockResolvedValue(mockResult as any);
      const result = await service.getCashHoldings();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getCashHoldingById', () => {
    it('should return a specific cash holding by ID', async () => {
      const mockResult = { id: 1, amount: 100 };
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockResult as any);
      const result = await service.getCashHoldingById(1);
      expect(result).toEqual(mockResult);
    });
  });

  // אפשר להוסיף עוד טסטים ל-create, update, subtract בהתאם לצורך
});
