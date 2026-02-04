import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoansService } from './loans.service';
import { LoanEntity } from './Entity/loans.entity';
import { LoanActionEntity } from './loan-actions/Entity/loan_actions.entity';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UsersService } from '../users/users.service';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';
import { FundsFlowService } from './calcelete.service';
import { LoanActionsService } from './loan-actions/loan_actions.service';
import { LoanActionBalanceService } from './loan-actions/loan_action_balance.service';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

describe('LoansService', () => {
  let service: LoansService;
  let loansRepo: jest.Mocked<Repository<LoanEntity>>;
  let fundsOverviewService: { getFundDetails: jest.Mock };
  let usersService: { getUserById: jest.Mock };
  let fundsFlowService: { getCashFlowTotals: jest.Mock };
  let loanActionBalanceService: { computeLoanNetBalance: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: getRepositoryToken(LoanEntity), useFactory: mockRepo },
        { provide: getRepositoryToken(LoanActionEntity), useFactory: mockRepo },
        { provide: FundsOverviewService, useValue: { getFundDetails: jest.fn() } },
        { provide: UsersService, useValue: { getUserById: jest.fn() } },
        { provide: FundsOverviewByYearService, useValue: {} },
        { provide: FundsFlowService, useValue: { getCashFlowTotals: jest.fn() } },
        { provide: LoanActionsService, useValue: {} },
        {
          provide: LoanActionBalanceService,
          useValue: { computeLoanNetBalance: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    loansRepo = module.get(getRepositoryToken(LoanEntity));
    fundsOverviewService = module.get(FundsOverviewService);
    usersService = module.get(UsersService);
    fundsFlowService = module.get(FundsFlowService);
    loanActionBalanceService = module.get(LoanActionBalanceService);
  });

  describe('checkLoan', () => {
    it('returns ok=false when available funds are insufficient', async () => {
      fundsOverviewService.getFundDetails.mockResolvedValue({
        available_funds: 100,
      });

      const result = await service.checkLoan({
        user: { id: 1 } as any,
        loan_amount: 500,
        loan_date: new Date(),
      });

      expect(result.ok).toBe(false);
      expect(result.butten).toBe(false);
    });

    it('returns ok=true when funds and cashflow are sufficient', async () => {
      fundsOverviewService.getFundDetails.mockResolvedValue({
        available_funds: 1000,
      });
      loansRepo.find.mockResolvedValue([]);
      fundsFlowService.getCashFlowTotals.mockResolvedValue(true);

      const result = await service.checkLoan({
        user: { id: 1 } as any,
        loan_amount: 500,
        loan_date: new Date(),
      });

      expect(result.ok).toBe(true);
      expect(result.butten).toBe(true);
    });
  });

  describe('createLoan', () => {
    it('throws when funds are insufficient', async () => {
      fundsOverviewService.getFundDetails.mockResolvedValue({
        available_funds: 10,
      });

      await expect(
        service.createLoan({
          user: 1 as any,
          loan_amount: 200,
          monthly_payment: 50,
          loan_date: new Date(),
        })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates a loan and computes balance', async () => {
      fundsOverviewService.getFundDetails.mockResolvedValue({
        available_funds: 1000,
      });
      usersService.getUserById.mockResolvedValue({ id: 1 });
      loansRepo.create.mockImplementation((v: any) => ({ ...v }));
      loansRepo.save.mockImplementation(async (v: any) => ({ ...v, id: 7 }));

      const result = await service.createLoan({
        user: 1 as any,
        loan_amount: 500,
        monthly_payment: 50,
        loan_date: new Date(),
      });

      expect(loansRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          remaining_balance: 500,
          initial_loan_amount: 500,
          initial_monthly_payment: 50,
        })
      );
      expect(loanActionBalanceService.computeLoanNetBalance).toHaveBeenCalledWith(7);
      expect(result.id).toBe(7);
    });
  });
});
