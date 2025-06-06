import { Test, TestingModule } from '@nestjs/testing';
import { FundsOverviewService } from './funds-overview.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FundsOverviewEntity } from './entity/funds-overview.entity';
import { Repository } from 'typeorm';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockFund: FundsOverviewEntity = {
  id: 1,
  own_equity: 1000,
  available_funds: 1000,
  total_loaned_out: 0,
  total_invested: 0,
  Investment_profits: 0,
  special_funds: 0,
  cash_holdings: 0,
  monthly_deposits: 0,
  total_donations: 0,
  total_user_deposits: 0,
  total_expenses: 0,
  fund_principal : 1000,
  standing_order_return: 0,
  fund_details: {},
  total_equity_donations: 0,
};

describe('FundsOverviewService', () => {
  let service: FundsOverviewService;
  let repo: jest.Mocked<Repository<FundsOverviewEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundsOverviewService,
        { provide: getRepositoryToken(FundsOverviewEntity), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<FundsOverviewService>(FundsOverviewService);
    repo = module.get(getRepositoryToken(FundsOverviewEntity));
  });

  describe('getFundsOverviewRecord', () => {
    it('should return first fund record or null', async () => {
      repo.find.mockResolvedValue([mockFund]);
      const result = await service.getFundsOverviewRecord();
      expect(result).toBe(mockFund);
    });
  });

  describe('initializeFundsOverview', () => {
    it('should create a new record if none exists', async () => {
      repo.find.mockResolvedValue([]);
      repo.create.mockReturnValue(mockFund);
      repo.save.mockResolvedValue(mockFund);

      const result = await service.initializeFundsOverview(1000);
      expect(result.data).toEqual(mockFund);
    });

    it('should throw if record already exists', async () => {
      repo.find.mockResolvedValue([mockFund]);
      await expect(service.initializeFundsOverview(1000)).rejects.toThrow('Funds overview already initialized');
    });
  });

  describe('addDonation', () => {
    it('should increase funds by donation amount', async () => {
      const updatedFund = { ...mockFund, donations_received: 100, total_funds: 1100, available_funds: 1100 };
      repo.find.mockResolvedValue([mockFund]);
      repo.save.mockResolvedValue(updatedFund);

      const result = await service.addDonation(100);
      expect(result.total_donations).toBe(100);
    });
  });

  describe('addLoan', () => {
    it('should throw if not enough funds', async () => {
      repo.find.mockResolvedValue([{ ...mockFund, available_funds: 0 }]);
      await expect(service.addLoan(100)).rejects.toThrow('not enough funds');
    });
  });
});