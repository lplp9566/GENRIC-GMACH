import { Test, TestingModule } from '@nestjs/testing';
import { LoanActionsService } from './loan_actions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoanEntity } from '../loans.entity';
import { LoanActionEntity } from './loan_actions.entity';
import { PaymentDetailsEntity } from '../../users/payment-details/payment_details.entity';
import { Repository } from 'typeorm';
import { UserFinancialByYearService } from '../../users/user-financials-by-year/user-financial-by-year.service';
import { UserFinancialsService } from '../../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../../funds-overview/funds-overview.service';
import { LoansService } from '../loans.service';
import { UsersService } from '../../users/users.service';
import { LoanPaymentActionType } from '../loan-dto/loanTypes';
import { UserEntity } from '../../users/user.entity';
import { UserFinancialEntity } from '../../users/user-financials/user-financials.entity';
import { payment_method, UserRole } from '../../users/userTypes';
import { FundsOverviewByYearService } from '../../funds-overview-by-year/funds-overview-by-year.service';

const mockLoanRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockPaymentRepo = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockDetailsRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

describe('LoanActionsService', () => {
  let service: LoanActionsService;
  let loansRepo: jest.Mocked<Repository<LoanEntity>>;
  let paymentsRepo: jest.Mocked<Repository<LoanActionEntity>>;
  let detailsRepo: jest.Mocked<Repository<PaymentDetailsEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanActionsService,
        { provide: getRepositoryToken(LoanEntity), useFactory: mockLoanRepo },
        { provide: getRepositoryToken(LoanActionEntity), useFactory: mockPaymentRepo },
        { provide: getRepositoryToken(PaymentDetailsEntity), useFactory: mockDetailsRepo },
        { provide: UserFinancialByYearService, useValue: { recordLoanRepaid: jest.fn() } },
        { provide: UserFinancialsService, useValue: { recordLoanRepaid: jest.fn() } },
        { provide: FundsOverviewService, useValue: { repayLoan: jest.fn() } },
        { provide: LoansService, useValue: {
          changeLoanAmount: jest.fn().mockResolvedValue({ id: 1 }),
          changeMonthlyPayment: jest.fn().mockResolvedValue({ id: 2 }),
          changeDateOfPayment: jest.fn().mockResolvedValue({ id: 3 }),
        } },
        { provide: UsersService, useValue: { getUserById: jest.fn() } },
                { provide: FundsOverviewByYearService,useValue: FundsOverviewByYearService },
        
      ],
    }).compile();

    service = module.get<LoanActionsService>(LoanActionsService);
    loansRepo = module.get(getRepositoryToken(LoanEntity));
    paymentsRepo = module.get(getRepositoryToken(LoanActionEntity));
    detailsRepo = module.get(getRepositoryToken(PaymentDetailsEntity));

    jest.spyOn(service, 'getLoanPayments').mockResolvedValue([]);
    const mockUser: UserEntity = {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        id_number: '123456789',
        join_date: new Date(),
        password: 'pass',
        email_address: 'test@example.com',
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
        },
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
        orderReturns: [],
      };
  
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
    // ✅ הוספת mock לפרטי תשלום
    detailsRepo.findOne.mockResolvedValue({
        id: 1,
        user: mockUser,
        bank_number: 10,
        bank_branch: 123,
        bank_account_number: 456789,
        charge_date: '15',
        payment_method: payment_method.bank_transfer,
        monthly_balance: 0,
        loan_balances: [],
      } as PaymentDetailsEntity);
    }   
  );      

  it('should be defined', () => {
    expect(service).toBeDefined();
  });



  it('should route to changeLoanAmount when action_type is AMOUNT_CHANGE', async () => {
    const dto = { loanId: 1, date: new Date(), amount: 1000, action_type: LoanPaymentActionType.AMOUNT_CHANGE };
    const result = await service.handleLoanAction(dto);
    expect(result.id).toBe(1);
  });

  it('should route to changeMonthlyPayment when action_type is MONTHLY_PAYMENT_CHANGE', async () => {
    const dto = { loanId: 1, date: new Date(), amount: 200, action_type: LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE };
    const result = await service.handleLoanAction(dto);
    expect(result.id).toBe(2);
  });

  it('should route to changeDateOfPayment when action_type is DATE_OF_PAYMENT_CHANGE', async () => {
    const dto = { loanId: 1, date: new Date(), amount: 15, action_type: LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE };
    const result = await service.handleLoanAction(dto);
    expect(result.id).toBe(3);
  });
});
