import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserFinancialByYearService } from './user-financial-by-year.service';
import { UserFinancialByYearEntity } from './user-financial-by-year.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';
import { UserRole } from '../userTypes';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('UserFinancialByYearService', () => {
  let service: UserFinancialByYearService;
  let repo: jest.Mocked<Repository<UserFinancialByYearEntity>>;

  const mockUser: UserEntity = {
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    id_number: '123456789',
    join_date: new Date(),
    password: 'pass',
    email_address: 'test@example.com',
    phone_number: '0501234567',
    role: UserRole.committeeMember ,
    is_admin: false,
    payment_details: {} as any,
    loans: [],
    financialHistoryByYear: [],
    userFinancials: {} as any,
    monthly_deposits: [],
    donations: [],
    requests: [],
    cashHoldings: [],
    orderReturns :[]   
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserFinancialByYearService,
        {
          provide: getRepositoryToken(UserFinancialByYearEntity),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UserFinancialByYearService>(UserFinancialByYearService);
    repo = module.get(getRepositoryToken(UserFinancialByYearEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all user financial records', async () => {
    const mockRecords = [{ id: 1 }] as any;
    repo.find.mockResolvedValue(mockRecords);
    const result = await service.getUserFinancials();
    expect(result).toEqual(mockRecords);
  });

  it('should create a record if not found', async () => {
    repo.findOne.mockResolvedValue(null);
    const mockCreated = { id: 1, year: 2025, user: mockUser } as any;
    repo.create.mockReturnValue(mockCreated);
    repo.save.mockResolvedValue(mockCreated);

    const result = await service['getOrCreateFinancialRecord'](mockUser, 2025);
    expect(result).toEqual(mockCreated);
  });

  it('should update monthly deposit', async () => {
    const mockRecord = { total_monthly_deposits: 0, user: mockUser } as any;
    jest.spyOn(service as any, 'getOrCreateFinancialRecord').mockResolvedValue(mockRecord);
    repo.save.mockResolvedValue({ ...mockRecord, total_monthly_deposits: 100 });

    const result = await service.recordMonthlyDeposit(mockUser, 2025, 100);
    expect(result.total_monthly_deposits).toBe(100);
  });

  it('should update equity donation', async () => {
    const mockRecord = { total_equity_donations: 0, user: mockUser } as any;
    jest.spyOn(service as any, 'getOrCreateFinancialRecord').mockResolvedValue(mockRecord);
    repo.save.mockResolvedValue({ ...mockRecord, total_equity_donations: 50 });

    const result = await service.recordEquityDonation(mockUser, 2025, 50);
    expect(result.total_equity_donations).toBe(50);
  });

  it('should update special fund donation', async () => {
    const mockRecord = { special_fund_donations: 0, user: mockUser } as any;
    jest.spyOn(service as any, 'getOrCreateFinancialRecord').mockResolvedValue(mockRecord);
    repo.save.mockResolvedValue({ ...mockRecord, special_fund_donations: 75 });

    const result = await service.recordSpecialFundDonation(mockUser, 2025, 75);
    expect(result.special_fund_donations).toBe(75);
  });
});
