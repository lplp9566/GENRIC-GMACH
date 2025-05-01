import { Test, TestingModule } from '@nestjs/testing';
import { UserFinancialsService } from './user-financials.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserFinancialEntity } from './user-financials.entity';
import { UsersService } from '../users.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';
import { payment_method, UserRole } from '../userTypes';
import { PaymentDetailsEntity } from '../payment-details/payment_details.entity';

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('UserFinancialsService', () => {
  let service: UserFinancialsService;
  let repo: ReturnType<typeof mockRepo>;
  const mockPaymentDetails: PaymentDetailsEntity = {
    id: 1,
    user: {} as any, // אפשר גם לשים כאן את אותו mockUser אם כבר הגדרת
    bank_number: 12,
    bank_branch: 34,
    bank_account_number: 567890,
    charge_date: '15',
    payment_method: payment_method.bank_transfer,
    monthly_balance: 0,
    loan_balances: [],
  };
  const mockUserFinancials: UserFinancialEntity = {
    id: 1,
    user: {} as any, // או את אותו mockUser
    total_donations: 0,
    total_monthly_deposits: 0,
    total_equity_donations: 0,
    total_special_fund_donations: 0,
    total_loans_taken: 0,
    total_loans_repaid: 0,
    total_fixed_deposits_deposited: 0,
    total_fixed_deposits_withdrawn: 0,
  };
  const mockUser: UserEntity = {
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    join_date: new Date(),
    id_number: '123456789',
    password: 'pass',
    email_address: 'test@example.com',
    phone_number: '0501234567',
    role: UserRole.committeeMember,
    is_admin: false,
    payment_details: mockPaymentDetails,
    loans: [],
    financialHistoryByYear: [],
    userFinancials: mockUserFinancials,
    monthly_deposits: [],
    donations: [],
    requests: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserFinancialsService,
        { provide: getRepositoryToken(UserFinancialEntity), useFactory: mockRepo },
        { provide: UsersService, useValue: { getUserById: jest.fn() } },
      ],
    }).compile();

    service = module.get<UserFinancialsService>(UserFinancialsService);
    repo = module.get(getRepositoryToken(UserFinancialEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create new financial record if not exists', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue({ user: mockUser, total_donations: 0 });
    repo.save.mockResolvedValue({ id: 1, user: mockUser, total_donations: 0 });

    const result = await service.getOrCreateUserFinancials(mockUser);
    expect(result.total_donations).toBe(0);
  });

  it('should record equity donation', async () => {
    const record = { user: mockUser, total_donations: 0, total_equity_donations: 0 };
    repo.findOne.mockResolvedValue(record);
    repo.save.mockResolvedValue({ ...record, total_donations: 100, total_equity_donations: 100 });

    const result = await service.recordEquityDonation(mockUser, 100);
    expect(result.total_equity_donations).toBe(100);
  });

  it('should record special fund donation', async () => {
    const record = { user: mockUser, total_donations: 0, total_special_fund_donations: 0 };
    repo.findOne.mockResolvedValue(record);
    repo.save.mockResolvedValue({ ...record, total_donations: 150, total_special_fund_donations: 150 });

    const result = await service.recordSpecialFundDonation(mockUser, 150);
    expect(result.total_special_fund_donations).toBe(150);
  });

  it('should record loan taken', async () => {
    const record = { user: mockUser, total_loans_taken: 0 };
    repo.findOne.mockResolvedValue(record);
    repo.save.mockResolvedValue({ ...record, total_loans_taken: 500 });

    const result = await service.recordLoanTaken(mockUser, 500);
    expect(result.total_loans_taken).toBe(500);
  });

  it('should record loan repaid', async () => {
    const record = { user: mockUser, total_loans_repaid: 0 };
    repo.findOne.mockResolvedValue(record);
    repo.save.mockResolvedValue({ ...record, total_loans_repaid: 200 });

    const result = await service.recordLoanRepaid(mockUser, 200);
    expect(result.total_loans_repaid).toBe(200);
  });
});
