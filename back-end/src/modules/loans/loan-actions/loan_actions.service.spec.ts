import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoanActionsService } from './loan_actions.service';
import { LoanEntity } from '../Entity/loans.entity';
import { LoanActionEntity } from './Entity/loan_actions.entity';
import { LoansService } from '../loans.service';
import { UserFinancialByYearService } from '../../users/user-financials-by-year/user-financial-by-year.service';
import { UserFinancialService } from '../../users/user-financials/user-financials.service';
import { UsersService } from '../../users/users.service';
import { FundsOverviewByYearService } from '../../funds-overview-by-year/funds-overview-by-year.service';
import { PaymentDetailsService } from '../../users/payment-details/payment-details.service';
import { LoanActionBalanceService } from './loan_action_balance.service';
import { LoanActionDto, LoanPaymentActionType } from '../loan-dto/loanTypes';
import { MailService } from '../../mail/mail.service';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
});

describe('LoanActionsService', () => {
  let service: LoanActionsService;
  let loansRepo: jest.Mocked<Repository<LoanEntity>>;
  let paymentsRepo: jest.Mocked<Repository<LoanActionEntity>>;
  let loansService: { changeLoanAmount: jest.Mock };
  let paymentDetailsService: { deleteLoanBalance: jest.Mock };
  let loanActionBalanceService: { computeLoanNetBalance: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanActionsService,
        { provide: getRepositoryToken(LoanEntity), useFactory: mockRepo },
        { provide: getRepositoryToken(LoanActionEntity), useFactory: mockRepo },
        { provide: LoansService, useValue: { changeLoanAmount: jest.fn() } },
        { provide: UserFinancialByYearService, useValue: {} },
        { provide: UserFinancialService, useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: FundsOverviewByYearService, useValue: {} },
        { provide: PaymentDetailsService, useValue: { deleteLoanBalance: jest.fn() } },
        {
          provide: LoanActionBalanceService,
          useValue: { computeLoanNetBalance: jest.fn() },
        },
        {
          provide: MailService,
          useValue: {
            formatCurrency: jest.fn((v: number) => String(v)),
            sendReceiptNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LoanActionsService>(LoanActionsService);
    loansRepo = module.get(getRepositoryToken(LoanEntity));
    paymentsRepo = module.get(getRepositoryToken(LoanActionEntity));
    loansService = module.get(LoansService);
    paymentDetailsService = module.get(PaymentDetailsService);
    loanActionBalanceService = module.get(LoanActionBalanceService);
  });

  describe('handleLoanAction', () => {
    it('routes AMOUNT_CHANGE to LoansService.changeLoanAmount', async () => {
      const dto = { action_type: LoanPaymentActionType.AMOUNT_CHANGE } as any;
      loansService.changeLoanAmount.mockResolvedValue({ id: 1 });

      const result = await service.handleLoanAction(dto);

      expect(loansService.changeLoanAmount).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1 });
    });

    it('throws on unknown action type', async () => {
      await expect(
        service.handleLoanAction({ action_type: 'UNKNOWN' } as any)
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('addLoanPayment', () => {
    it('marks loan inactive and deletes balance when fully paid', async () => {
      const loan = {
        id: 1,
        user: { id: 10 },
        remaining_balance: 100,
        monthly_payment: 50,
        total_remaining_payments: 0,
        total_installments: 2,
        isActive: true,
      } as any;
      loansRepo.findOne.mockResolvedValue(loan);
      paymentsRepo.create.mockReturnValue({ id: 99 } as any);
      paymentsRepo.save.mockResolvedValue({ id: 99 } as any);
      loansRepo.save.mockResolvedValue(loan as any);

      const dto: LoanActionDto = {
        loanId: 1,
        value: 100,
        date: new Date(),
        action_type: LoanPaymentActionType.PAYMENT,
      } as any;

      const result = await service.addLoanPayment(dto);

      expect(result).toEqual({ id: 99 });
      expect(loan.isActive).toBe(false);
      expect(loan.remaining_balance).toBe(0);
      expect(paymentDetailsService.deleteLoanBalance).toHaveBeenCalledWith(1, 10);
      expect(loanActionBalanceService.computeLoanNetBalance).toHaveBeenCalledWith(1);
    });
  });
});
