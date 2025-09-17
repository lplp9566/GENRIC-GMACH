import { Test, TestingModule } from '@nestjs/testing';
import { DepositsService } from './deposits.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { UserFinancialService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';
import { DepositsEntity } from './Entity/deposits.entity';

describe('DepositsService', () => {
  let service: DepositsService;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockUsersService = {
    getUserById: jest.fn(),
  };

  const mockUserFinByYear = { recordFixedDepositAdded: jest.fn(), recordFixedDepositWithdrawn: jest.fn() };
  const mockUserFin = { recordFixedDepositAdded: jest.fn(), recordFixedDepositWithdrawn: jest.fn() };
  const mockOverview = { addToDepositsTotal: jest.fn(), decreaseUserDepositsTotal: jest.fn() };
  const mockOverviewByYear = { recordFixedDepositAdded: jest.fn(), recordFixedDepositWithdrawn: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositsService,
        { provide: getRepositoryToken(DepositsEntity), useValue: mockRepo },
        { provide: UsersService, useValue: mockUsersService },
        { provide: UserFinancialByYearService, useValue: mockUserFinByYear },
        { provide: UserFinancialService, useValue: mockUserFin },
        { provide: FundsOverviewService, useValue: mockOverview },
        { provide: FundsOverviewByYearService, useValue: mockOverviewByYear },
      ],
    }).compile();

    service = module.get<DepositsService>(DepositsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return active deposits', async () => {
    const mockData = [{ id: 1, isActive: true }];
    mockRepo.find.mockResolvedValue(mockData);
    const result = await service.getDepositsActive();
    expect(result).toEqual(mockData);
    expect(mockRepo.find).toHaveBeenCalledWith({ where: { isActive: true } });
  });

  it('should create a new deposit', async () => {
    const deposit = {
      user: 1,
      start_date: new Date('2024-01-01'),
      initialDeposit: 1000,
    } as any;
    const mockUser = { id: 1 };
    mockUsersService.getUserById.mockResolvedValue(mockUser);
    mockRepo.save.mockResolvedValue({ id: 10, ...deposit });

    const result = await service.createDeposit(deposit);

    expect(result.id).toBe(10);
    expect(mockOverview.addToDepositsTotal).toHaveBeenCalledWith(1000);
    expect(mockUserFin.recordFixedDepositAdded).toHaveBeenCalled();
  });

  it('should update end date', async () => {
    const deposit = { id: 1, end_date: new Date() };
    mockRepo.findOne.mockResolvedValue(deposit);
    mockRepo.save.mockResolvedValue({ ...deposit, end_date: new Date('2030-01-01') });

    const result = await service.editEndDate(1, new Date('2030-01-01'));
    expect(result.end_date.toISOString()).toContain('2030-01-01');
  });

  it('should withdraw deposit', async () => {
    const deposit = {
      id: 1,
      current_balance: 1000,
      isActive: true,
      start_date: new Date(),
      user: { id: 1 },
    } as any;
    mockRepo.save.mockResolvedValue(true);
    mockRepo.findOne.mockResolvedValue(deposit);

    const result = await service.withdrawDeposit(deposit, 500, new Date('2025-01-01'));

    expect(mockOverview.decreaseUserDepositsTotal).toHaveBeenCalledWith(500);
    expect(mockUserFin.recordFixedDepositWithdrawn).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should throw if withdrawal is more than balance', async () => {
    const deposit = {
      current_balance: 100,
      user: { id: 1 },
    } as any;

    await expect(service.withdrawDeposit(deposit, 200, new Date())).rejects.toThrow('Not enough balance');
  });
});
