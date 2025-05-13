import { Test, TestingModule } from '@nestjs/testing';
import { LoanActionsService } from './loan_actions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoanEntity } from '../Entity/loans.entity';
import { LoanActionEntity } from './Entity/loan_actions.entity';
import { PaymentDetailsEntity } from '../../users/payment-details/payment_details.entity';
import { Repository } from 'typeorm';
import { UserFinancialByYearService } from '../../users/user-financials-by-year/user-financial-by-year.service';
import { UserFinancialService } from '../../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../../funds-overview/funds-overview.service';
import { LoansService } from '../loans.service';
import { UsersService } from '../../users/users.service';
import { LoanPaymentActionType } from '../loan-dto/loanTypes';
import { UserEntity } from '../../users/user.entity';
import { FundsOverviewByYearService } from '../../funds-overview-by-year/funds-overview-by-year.service';
import { LoanActionBalanceService } from './loan_action_balance.service';

const mockLoanRepo = () => ({ findOne: jest.fn(), save: jest.fn() });
const mockPaymentRepo = () => ({ find: jest.fn(), create: jest.fn(), save: jest.fn() });
const mockDetailsRepo = () => ({ findOne: jest.fn(), save: jest.fn() });

describe('LoanActionsService', () => {
  let service: LoanActionsService;
  let loansRepo: jest.Mocked<Repository<LoanEntity>>;
  let paymentsRepo: jest.Mocked<Repository<LoanActionEntity>>;

  const mockLoan: LoanEntity = {
    id: 1,
    isActive: true,
    payment_date: 10,
    loan_amount: 1000,
    loan_date: new Date(),
    monthly_payment: 100,
    remaining_balance: 1000,
    initialMonthlyPayment: 100,
    total_installments: 10,
    payments: [],
    user: { id: 1 } as UserEntity,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanActionsService,
        { provide: getRepositoryToken(LoanEntity), useFactory: mockLoanRepo },
        { provide: getRepositoryToken(LoanActionEntity), useFactory: mockPaymentRepo },
        { provide: getRepositoryToken(PaymentDetailsEntity), useFactory: mockDetailsRepo },
        { provide: UserFinancialByYearService, useValue: { recordLoanRepaid: jest.fn() } },
        { provide: UserFinancialService, useValue: { recordLoanRepaid: jest.fn() } },
        { provide: FundsOverviewService, useValue: { repayLoan: jest.fn() } },
        { provide: LoansService, useValue: {
            changeLoanAmount: jest.fn().mockResolvedValue({ id: 1 }),
            changeMonthlyPayment: jest.fn().mockResolvedValue({ id: 2 }),
            changeDateOfPayment: jest.fn().mockResolvedValue({ id: 3 }),
        }},
        { provide: UsersService, useValue: {} },
        { provide: FundsOverviewByYearService, useValue: { recordLoanRepaid: jest.fn() } },
        { provide: LoanActionBalanceService, useValue: { computeLoanNetBalance: jest.fn() } },
      ],
    }).compile();

    service = module.get<LoanActionsService>(LoanActionsService);
    loansRepo = module.get(getRepositoryToken(LoanEntity));
    paymentsRepo = module.get(getRepositoryToken(LoanActionEntity));
    loansRepo.findOne.mockResolvedValue(mockLoan);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should route to changeLoanAmount when action_type is AMOUNT_CHANGE', async () => {
    const dto = { loanId: 1, date: new Date(), value: 1000, action_type: LoanPaymentActionType.AMOUNT_CHANGE };
    const result = await service.handleLoanAction(dto);
    expect(result.id).toBe(1);
  });

  it('should route to changeMonthlyPayment when action_type is MONTHLY_PAYMENT_CHANGE', async () => {
    const dto = { loanId: 1, date: new Date(), value: 200, action_type: LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE };
    const result = await service.handleLoanAction(dto);
    expect(result.id).toBe(2);
  });

  it('should route to changeDateOfPayment when action_type is DATE_OF_PAYMENT_CHANGE', async () => {
    const dto = { loanId: 1, date: new Date(), value: 15, action_type: LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE };
    const result = await service.handleLoanAction(dto);
    expect(result.id).toBe(3);
  });

  it('should process a payment (PAYMENT)', async () => {
    const dto = {
      loanId: 1,
      date: new Date(),
      value: 100,
      action_type: LoanPaymentActionType.PAYMENT,
    };

    paymentsRepo.create.mockReturnValue({
      id: 99,
      date: dto.date,
      loan: mockLoan,
      value: dto.value,
      action_type: LoanPaymentActionType.PAYMENT,
    } as LoanActionEntity);

    paymentsRepo.save.mockResolvedValue({
      id: 99,
      date: dto.date,
      loan: mockLoan,
      value: dto.value,
      action_type: LoanPaymentActionType.PAYMENT,
    });

    const result = await service.handleLoanAction(dto);
    expect(result).toHaveProperty('id', 99);
    expect(paymentsRepo.save).toHaveBeenCalled();
  });

  it('should return sorted loan payments', async () => {
    const payments = [
      {
        id: 2,
        date: new Date('2023-02-01'),
        loan: mockLoan,
        value: 100,
        action_type: LoanPaymentActionType.PAYMENT,
      },
      {
        id: 1,
        date: new Date('2023-01-01'),
        loan: mockLoan,
        value: 100,
        action_type: LoanPaymentActionType.PAYMENT,
      },
    ];
    loansRepo.findOne.mockResolvedValue(mockLoan);
    paymentsRepo.find.mockResolvedValue(payments);

    const result = await service.getLoanPayments(1);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(2);
  });

  it('should throw on unknown action type', async () => {
    const dto = {
      loanId: 1,
      date: new Date(),
      value: 100,
      action_type: 'INVALID_TYPE' as any,
    };
    await expect(service.handleLoanAction(dto)).rejects.toThrow('Unknown action type');
  });
});
