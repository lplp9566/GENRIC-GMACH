import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FundsOverviewByYearService } from './funds-overview-by-year.service';
import { FundsOverviewByYearEntity } from './Entity/funds-overview-by-year.entity';
import { Repository } from 'typeorm';

describe('FundsOverviewByYearService', () => {
  let service: FundsOverviewByYearService;
  let repo: jest.Mocked<Repository<FundsOverviewByYearEntity>>;

  const mockRepo = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundsOverviewByYearService,
        {
          provide: getRepositoryToken(FundsOverviewByYearEntity),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get(FundsOverviewByYearService);
    repo = module.get(getRepositoryToken(FundsOverviewByYearEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateOverview', () => {
    it('should return existing record if found', async () => {
      const existing = { year: 2025 } as FundsOverviewByYearEntity;
      repo.findOne.mockResolvedValue(existing);
      const result = await service.getOrCreateOverview(2025);
      expect(result).toBe(existing);
    });

    it('should create and save new record if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({ year: 2025 } as any);
      repo.save.mockResolvedValue({ year: 2025 } as any);
      const result = await service.getOrCreateOverview(2025);
      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result.year).toBe(2025);
    });
  });

  it('should record monthly deposit', async () => {
    const mockRecord = { total_monthly_deposits: 0 } as FundsOverviewByYearEntity;
    repo.findOne.mockResolvedValue(mockRecord);
    repo.save.mockResolvedValue({ total_monthly_deposits: 100 } as FundsOverviewByYearEntity);
    const result = await service.recordMonthlyDeposit(2025, 100);
    expect(result.total_monthly_deposits).toBe(100);
  });

  it('should record equity donation', async () => {
    const mockRecord = { total_equity_donations: 0, total_donations: 0 } as FundsOverviewByYearEntity;
    repo.findOne.mockResolvedValue(mockRecord);
    repo.save.mockResolvedValue({ total_equity_donations: 200, total_donations: 200 } as any);
    const result = await service.recordEquityDonation(2025, 200);
    expect(result.total_equity_donations).toBe(200);
  });

  it('should record special fund donation by name', async () => {
    const mockRecord = { fund_details_donated: {}, special_fund_donations: 0 } as any;
    repo.findOne.mockResolvedValue(mockRecord);
    repo.save.mockResolvedValue({ fund_details_donated: { Shabbat: 300 } }as any );
    const result = await service.recordSpecialFundDonationByName(2025, 'Shabbat', 300);
    expect(result.fund_details_donated['Shabbat']).toBe(300);
  });

  it('should throw if withdrawing from unknown fund', async () => {
    const mockRecord = { fund_details_donated: {}, fund_details_withdrawn: {} } as any;
    repo.findOne.mockResolvedValue(mockRecord);
    await expect(service.recordSpecialFundWithdrawalByName(2025, 'UnknownFund', 100))
      .rejects
      .toThrow('No such fund to withdraw from');
  });

  it('should record loan taken', async () => {
    const record = { total_loans_taken: 0, total_loans_amount: 0 } as any;
    repo.findOne.mockResolvedValue(record);
    repo.save.mockResolvedValue({ total_loans_taken: 1, total_loans_amount: 5000 }as any);
    const result = await service.recordLoanTaken(2025, 5000);
    expect(result.total_loans_amount).toBe(5000);
  });

  it('should record loan repayment', async () => {
    const record = { total_loans_repaid: 0 } as any;
    repo.findOne.mockResolvedValue(record);
    repo.save.mockResolvedValue({ total_loans_repaid: 200 }as any);
    const result = await service.recordLoanRepaid(2025, 200);
    expect(result.total_loans_repaid).toBe(200);
  });

  it('should record fixed deposit addition', async () => {
    const record = { total_fixed_deposits_added: 0 } as any;
    repo.findOne.mockResolvedValue(record);
    repo.save.mockResolvedValue({ total_fixed_deposits_added: 1000 }as any);
    const result = await service.recordFixedDepositAdded(2025, 1000);
    expect(result.total_fixed_deposits_added).toBe(1000);
  });

  it('should record investment in and out', async () => {
    const record = { total_investments_in: 0, total_investments_out: 0 } as any;
    repo.findOne.mockResolvedValue(record);

    await service.recordInvestmentIn(2025, 500);
    await service.recordInvestmentOut(2025, 250);

    expect(repo.save).toHaveBeenCalledTimes(2);
  });

  it('should record standing order return', async () => {
    const record = { total_standing_order_return: 0 } as any;
    repo.findOne.mockResolvedValue(record);
    repo.save.mockResolvedValue({ total_standing_order_return: 120 }as any);
    const result = await service.recordStandingOrderReturn(2025, 120);
    expect(result.total_standing_order_return).toBe(120);
  });

  it('should record expenses', async () => {
    const record = { total_expenses: 0 } as any;
    repo.findOne.mockResolvedValue(record);
    repo.save.mockResolvedValue({ total_expenses: 99.5 }as any);
    const result = await service.recordExpense(2025, 99.5);
    expect(result.total_expenses).toBe(99.5);
  });
});
