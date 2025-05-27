import { Test, TestingModule } from '@nestjs/testing';
import { FundsFlowService } from './calcelete.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MonthlyRatesEntity } from '../monthly_rates/monthly_rates.entity';
import { LoanEntity } from './Entity/loans.entity';
import { UserEntity } from '../users/user.entity';
import { DepositsService } from '../deposits/deposits.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { Repository } from 'typeorm';

describe('FundsFlowService', () => {
  let service: FundsFlowService;

  const mockRatesRepo = {
    find: jest.fn(),
  };

  const mockLoansRepo = {
    find: jest.fn(),
  };

  const mockUsersRepo = {
    find: jest.fn(),
  };

  const mockDepositsService = {
    getDepositsActive: jest.fn(),
  };

  const mockFundsOverviewService = {
    getFundDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundsFlowService,
        { provide: getRepositoryToken(MonthlyRatesEntity), useValue: mockRatesRepo },
        { provide: getRepositoryToken(LoanEntity), useValue: mockLoansRepo },
        { provide: getRepositoryToken(UserEntity), useValue: mockUsersRepo },
        { provide: DepositsService, useValue: mockDepositsService },
        { provide: FundsOverviewService, useValue: mockFundsOverviewService },
      ],
    }).compile();

    service = module.get<FundsFlowService>(FundsFlowService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateTotalMonthlyInflows', () => {
    it('should calculate inflows correctly for valid users', async () => {
      mockRatesRepo.find.mockResolvedValue([
        { year: 2025, month: 1, role: 'user', amount: 100 },
        { year: 2026, month: 1, role: 'user', amount: 120 },
      ]);

      mockUsersRepo.find.mockResolvedValue([
        {
          role: 'user',
          payment_details: { charge_date: '15' },
        },
      ]);

      const result = await service.calculateTotalMonthlyInflows(
        new Date('2025-01-01'),
        new Date('2025-04-30'),
      );

      expect(result).toBeGreaterThan(0);
      expect(mockRatesRepo.find).toHaveBeenCalled();
    });
  });

  describe('calculateLoanPaymentSum', () => {
    it('should return correct loan repayment sum', async () => {
      mockLoansRepo.find.mockResolvedValue([
        {
          loan_amount: 1000,
          monthly_payment: 250,
          payment_date: 15,
          remaining_balance: 750,
          isActive: true,
        },
      ]);

      const result = await service.calculateLoanPaymentSum(
        new Date('2025-01-01'),
        new Date('2025-04-01'),
      );

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('getCashFlowTotals', () => {
    it('should return true if no deposits exist', async () => {
      mockFundsOverviewService.getFundDetails.mockResolvedValue({ available_funds: 10000 });
      mockDepositsService.getDepositsActive.mockResolvedValue([]);
      const result = await service.getCashFlowTotals(new Date('2025-01-01'), {
        loan_amount: 5000,
        monthly_payment: 500,
        payment_date: 15,
      });
      expect(result).toBe(true);
    });

    it('should throw if available funds < loan amount', async () => {
      mockFundsOverviewService.getFundDetails.mockResolvedValue({ available_funds: 1000 });
      await expect(
        service.getCashFlowTotals(new Date('2025-01-01'), {
          loan_amount: 5000,
          monthly_payment: 500,
          payment_date: 15,
        }),
      ).rejects.toThrow('אין מספיק כסף במערכת להוציא הלוואה על סכום זה');
    });
  });
});
