import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoanEntity } from './loans.entity';
import { LoanPaymentEntity } from './loan-actions/loan_actions.entity';
import { Repository } from 'typeorm';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UsersService } from '../users/users.service';
import { LoanPaymentActionType } from './loan-dto/loanTypes';
import { UserEntity } from '../users/user.entity';
import { PaymentDetailsEntity } from '../users/payment-details/payment_details.entity';
import { UserFinancialEntity } from '../users/user-financials/user-financials.entity';
import { payment_method, UserRole } from '../users/userTypes';

const mockLoanRepo = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const mockPaymentRepo = () => ({
  find: jest.fn(),
  save: jest.fn(),
});

describe('LoansService', () => {
  let service: LoansService;
  let loanRepo: jest.Mocked<Repository<LoanEntity>>;
  let paymentRepo: jest.Mocked<Repository<LoanPaymentEntity>>;
  let usersService: UsersService;
  let fundsService: FundsOverviewService;
  let yearlyService: UserFinancialByYearService;
  let financialsService: UserFinancialsService;

  const mockUser: UserEntity = {
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    join_date: new Date(),
    password: 'pass',
    email_address: 'test@example.com',
    id_number: '123456789',
    phone_number: '0501234567',
    role: UserRole.committeeMember,
    is_admin: false,
    payment_details: {
      id: 1,
      user: {} as UserEntity,
      bank_number: 10,
      bank_branch: 123,
      bank_account_number: 456789,
      charge_date: '15',
      payment_method: payment_method.bank_transfer,
      monthly_balance: 0,
      loan_balances: [],
    } ,
    loans: [],
    financialHistoryByYear: [],
    userFinancials: {
      id: 1,
      user: {} as UserEntity,
      total_donations: 0,
      total_monthly_deposits: 0,
      total_equity_donations: 0,
      total_special_fund_donations: 0,
      total_loans_taken: 0,
      total_loans_repaid: 0,
      total_fixed_deposits_deposited: 0,
      total_fixed_deposits_withdrawn: 0,
    } as UserFinancialEntity,
    monthly_deposits: [],
    donations: [],
    requests: [],
    cashHoldings: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: getRepositoryToken(LoanEntity), useFactory: mockLoanRepo },
        { provide: getRepositoryToken(LoanPaymentEntity), useFactory: mockPaymentRepo },
        { provide: UserFinancialsService, useValue: { recordLoanTaken: jest.fn() } },
        { provide: UserFinancialByYearService, useValue: { recordLoanTaken: jest.fn() } },
        { provide: FundsOverviewService, useValue: { addLoan: jest.fn() } },
        { provide: UsersService, useValue: { getUserById: jest.fn() } },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    loanRepo = module.get(getRepositoryToken(LoanEntity));
    paymentRepo = module.get(getRepositoryToken(LoanPaymentEntity));
    usersService = module.get(UsersService);
    fundsService = module.get(FundsOverviewService);
    yearlyService = module.get(UserFinancialByYearService);
    financialsService = module.get(UserFinancialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('changeLoanAmount', () => {
    it('should update loan amount and save payment event', async () => {
      const dto = { loanId: 1, amount: 1200, date: new Date(), action_type: LoanPaymentActionType.AMOUNT_CHANGE };
      const mockLoan: LoanEntity = {
        id: 1,
        loan_amount: 1000,
        remaining_balance: 1000,
        monthly_payment: 100,
        isActive: true,
        loan_date: new Date(),
        payment_date: 15,
        initialMonthlyPayment: 100,
        total_installments: 10,
        payments: [],
        user: mockUser,
      };

      const mockPayment: LoanPaymentEntity = {
        id: 99,
        loan: mockLoan,
        amount: 200,
        date: dto.date,
        action_type: LoanPaymentActionType.AMOUNT_CHANGE,
      };

      loanRepo.findOne.mockResolvedValue(mockLoan);
      loanRepo.save.mockResolvedValue(mockLoan);
      paymentRepo.save.mockResolvedValue(mockPayment);

      const result = await service.changeLoanAmount(dto);
      expect(result.id).toBe(99);
    });
  });

  describe('changeMonthlyPayment', () => {
    it('should update loan monthly payment and save payment event', async () => {
      const dto = { loanId: 1, amount: 200, date: new Date(), action_type: LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE };
      const mockLoan: LoanEntity = {
        id: 1,
        remaining_balance: 1000,
        isActive: true,
        monthly_payment: 100,
        loan_amount: 1200,
        loan_date: new Date(),
        payment_date: 15,
        initialMonthlyPayment: 100,
        total_installments: 12,
        payments: [],
        user: mockUser,
      };

      const mockPayment: LoanPaymentEntity = {
        id: 88,
        loan: mockLoan,
        amount: 200,
        date: dto.date,
        action_type: LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE,
      };

      loanRepo.findOne.mockResolvedValue(mockLoan);
      loanRepo.save.mockResolvedValue(mockLoan);
      paymentRepo.save.mockResolvedValue(mockPayment);

      const result = await service.changeMonthlyPayment(dto);
      expect(result.id).toBe(88);
    });
  });

  describe('changeDateOfPayment', () => {
    it('should update loan payment date and save payment event', async () => {
      const dto = { loanId: 1, amount: 15, date: new Date() } as any;
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
        user: mockUser,
      };

      const mockPayment: LoanPaymentEntity = {
        id: 77,
        loan: mockLoan,
        amount: 15,
        date: dto.date,
        action_type: LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE,
      };

      loanRepo.findOne.mockResolvedValue(mockLoan);
      loanRepo.save.mockResolvedValue(mockLoan);
      paymentRepo.save.mockResolvedValue(mockPayment);

      const result = await service.changeDateOfPayment(dto);
      expect(result.id).toBe(77);
    });
  });
});
