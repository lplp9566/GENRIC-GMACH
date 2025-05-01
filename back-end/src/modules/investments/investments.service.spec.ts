import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentsService } from './investments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvestmentEntity } from './entity/investments.entity';
import { InvestmentTransactionService } from './investment-transactions/investment-transactions.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { Repository } from 'typeorm';

describe('InvestmentsService', () => {
  let service: InvestmentsService;

  const mockRepo = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  });

  const mockTransactionService = {
    createTransaction: jest.fn(),
  };

  const mockFundsOverviewService = {
    addInvestment: jest.fn(),
    addInvestmentProfits: jest.fn(),
  };

  const mockInvestment = {
    id: 1,
    investment_name: 'Test Fund',
    total_principal_invested: 1000,
    current_value: 1000,
    principal_remaining: 1000,
    profit_realized: 0,
    withdrawn_total: 0,
    management_fees_total: 0,
    start_date: new Date(),
    last_update: new Date(),
    is_active: true,
    transactions: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentsService,
        { provide: getRepositoryToken(InvestmentEntity), useFactory: mockRepo },
        { provide: InvestmentTransactionService, useValue: mockTransactionService },
        { provide: FundsOverviewService, useValue: mockFundsOverviewService },
      ],
    }).compile();

    service = module.get<InvestmentsService>(InvestmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
