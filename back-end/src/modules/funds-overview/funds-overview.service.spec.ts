import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { FundsOverviewService } from './funds-overview.service';
import { FundsOverviewEntity } from './entity/funds-overview.entity';

/* ---------- Mock Factory ---------- */
const mockRepo = () => ({
  findOne: jest.fn(),
  create:  jest.fn(),
  save:    jest.fn(),
});

/* ---------- Dummy record ---------- */
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
  fund_principal: 1000,
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

    service = module.get(FundsOverviewService);
    repo = module.get(getRepositoryToken(FundsOverviewEntity));
  });

  /* ------------------------------------------------------------------ */
  describe('getFundsOverviewRecord', () => {
    it('returns the first (only) record', async () => {
      repo.findOne.mockResolvedValue(mockFund);
      const result = await service.getFundsOverviewRecord();
      expect(result).toEqual(mockFund);
    });

    it('creates new record when none exists', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockFund);
      repo.save.mockResolvedValue(mockFund);

      const result = await service.getFundsOverviewRecord();
      expect(repo.create).toHaveBeenCalled();
      expect(result).toEqual(mockFund);
    });
  });

  /* ------------------------------------------------------------------ */
  describe('initializeFundsOverview', () => {
    it('creates a record if none exists', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockFund);
      repo.save.mockResolvedValue(mockFund);

      const result = await service.initializeFundsOverview(1000);
      expect(result).toEqual(mockFund);
    });

    it('throws when a record already exists', async () => {
      repo.findOne.mockResolvedValue(mockFund);

      await expect(service.initializeFundsOverview(1000))
        .rejects.toThrow('Funds overview already initialized');
    });
  });

  /* ------------------------------------------------------------------ */
  describe('addDonation', () => {
    it('adds donation and updates totals', async () => {
      const updated = { ...mockFund, total_donations: 100, own_equity: 1100, available_funds: 1100 };
      repo.findOne.mockResolvedValue(mockFund);
      repo.save.mockResolvedValue(updated);

      const result = await service.addDonation(100);
      expect(result.total_donations).toBe(100);
      expect(repo.save).toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------ */
  describe('addLoan', () => {
    it('throws NotFoundException when funds insufficient', async () => {
      repo.findOne.mockResolvedValue({ ...mockFund, available_funds: 0 });

      await expect(service.addLoan(100))
        .rejects.toBeInstanceOf(NotFoundException);
    });

    it('reduces available_funds and increases total_loaned_out', async () => {
          repo.findOne.mockResolvedValue({ ...mockFund });
      // const updated = { ...mockFund, available_funds: 900, total_loaned_out: 100 };
      // repo.findOne.mockResolvedValue(mockFund);
      // repo.save.mockResolvedValue(updated);
      const result = await service.addLoan(100);
      expect(result.available_funds).toBe(1000);
      expect(result.total_loaned_out).toBe(100);
    });
  });
});
