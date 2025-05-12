import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Expense } from './expenses.entity';
import { Repository } from 'typeorm';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const mockFundsOverviewService = () => ({
  addExpense: jest.fn(),
});

describe('ExpensesService', () => {
  let service: ExpensesService;
  let repo: jest.Mocked<Repository<Expense>>;
  let fundsOverview: ReturnType<typeof mockFundsOverviewService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: getRepositoryToken(Expense), useFactory: mockRepo },
        { provide: FundsOverviewService, useFactory: mockFundsOverviewService },
        {
          provide: FundsOverviewByYearService,
          useValue: { recordExpense: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    repo = module.get(getRepositoryToken(Expense));
    fundsOverview = module.get(FundsOverviewService);
  });

  describe('create', () => {
    it('should create and save an expense and add to funds overview ', async () => {
      const data = { amount: 100, expenseDate: new Date('2025-01-01') } as any;
      const created = { ...data, id: 1 };
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);
      const result = await service.create(data);
      expect(repo.create).toHaveBeenCalledWith(data);
      expect(fundsOverview.addExpense).toHaveBeenCalledWith(100);
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return all expenses with members', async () => {
      const expenses = [{ id: 1 }, { id: 2 }] as any[];
      repo.find.mockResolvedValue(expenses);
      const result = await service.findAll();
      expect(result).toEqual(expenses);
    });
  });

  describe('findOne', () => {
    it('should return expense if found', async () => {
      const expense = { id: 1 } as any;
      repo.findOne.mockResolvedValue(expense);
      const result = await service.findOne(1);
      expect(result).toEqual(expense);
    });

    it('should throw error if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(
        'Expense with id 999 not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete the expense', async () => {
      await service.delete(1);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });
  });
});
