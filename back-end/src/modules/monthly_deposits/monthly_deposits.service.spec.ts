import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyDepositsService } from './monthly_deposits.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MonthlyDepositsEntity } from './monthly_deposits.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { UserEntity } from '../users/user.entity';

const mockRepo = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ totalPaid: 1000 }),
  })),
});

describe('MonthlyDepositsService', () => {
  let service: MonthlyDepositsService;
  let repo: jest.Mocked<Repository<MonthlyDepositsEntity>>;
  let usersService: UsersService;
  let yearlyService: UserFinancialByYearService;
  let fundsService: FundsOverviewService;
  let userFinService: UserFinancialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonthlyDepositsService,
        { provide: getRepositoryToken(MonthlyDepositsEntity), useFactory: mockRepo },
        { provide: UsersService, useValue: { getUserById: jest.fn(), updateUserMonthlyBalance: jest.fn() } },
        { provide: UserFinancialByYearService, useValue: { recordMonthlyDeposit: jest.fn() } },
        { provide: FundsOverviewService, useValue: { addMonthlyDeposit: jest.fn() } },
        { provide: UserFinancialsService, useValue: { recordMonthlyDeposit: jest.fn() } },
      ],
    }).compile();

    service = module.get(MonthlyDepositsService);
    repo = module.get(getRepositoryToken(MonthlyDepositsEntity));
    usersService = module.get(UsersService);
    yearlyService = module.get(UserFinancialByYearService);
    fundsService = module.get(FundsOverviewService);
    userFinService = module.get(UserFinancialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all deposits', async () => {
    const mockData = [{ id: 1 }] as any;
    repo.find.mockResolvedValue(mockData);
    const result = await service.getAllDeposits();
    expect(result).toEqual(mockData);
  });

  it('should return user total deposits', async () => {
    const result = await service.getUserTotalDeposits(1);
    expect(result).toBe(1000);
  });

  it('should record monthly deposit', async () => {
    const user = { id: 1 } as UserEntity;
    const mockDeposit = {
      user: user,
      amount: 100,
      deposit_date: new Date(),
    } as MonthlyDepositsEntity;
    

    (usersService.getUserById as jest.Mock).mockResolvedValue(user);
    repo.create.mockReturnValue(mockDeposit);
    repo.save.mockResolvedValue(mockDeposit);

    const result = await service.recordMonthlyDeposit(mockDeposit);
    expect(result).toEqual({ message: 'Deposit recorded successfully.' });
  });
});
