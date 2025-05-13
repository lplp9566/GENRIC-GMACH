import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentTransactionService } from './investment-transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvestmentTransactionEntity } from './entity/investment-transaction.entity';
import { InvestmentEntity } from '../entity/investments.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TransactionType } from '../investments_dto';

describe('InvestmentTransactionService', () => {
  let service: InvestmentTransactionService;
  let transactionRepo: jest.Mocked<Repository<InvestmentTransactionEntity>>;
  let investmentRepo: jest.Mocked<Repository<InvestmentEntity>>;

  const mockGetMany = jest.fn();

  const mockTransactionRepo = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: mockGetMany,
    } as unknown as SelectQueryBuilder<InvestmentTransactionEntity>)),
  });

  const mockInvestmentRepo = () => ({
    findOne: jest.fn(),
  });

  const mockTransaction: InvestmentTransactionEntity = {
    id: 1,
    investment: {} as InvestmentEntity,
    transaction_type: TransactionType.WITHDRAWAL,
    amount: 100,
    transaction_date: new Date(),
    note: 'Test transaction',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentTransactionService,
        { provide: getRepositoryToken(InvestmentTransactionEntity), useFactory: mockTransactionRepo },
        { provide: getRepositoryToken(InvestmentEntity), useFactory: mockInvestmentRepo },
      ],
    }).compile();

    service = module.get<InvestmentTransactionService>(InvestmentTransactionService);
    transactionRepo = module.get(getRepositoryToken(InvestmentTransactionEntity));
    investmentRepo = module.get(getRepositoryToken(InvestmentEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should throw if investment not found', async () => {
      investmentRepo.findOne.mockResolvedValue(null);
      await expect(service.createTransaction({
        investmentId: 1,
        transaction_type: TransactionType.WITHDRAWAL,
        amount: 100,
        transaction_date: new Date(),
      })).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTransactionsByInvestmentId', () => {
    it('should throw if investment not found', async () => {
      investmentRepo.findOne.mockResolvedValue(null);
      await expect(service.getTransactionsByInvestmentId(123)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions', async () => {
      transactionRepo.find.mockResolvedValue([mockTransaction]);
      const res = await service.getAllTransactions();
      expect(res).toEqual([mockTransaction]);
    });
  });

  describe('filterTransactions', () => {
    it('should return filtered transactions', async () => {
      mockGetMany.mockResolvedValue([mockTransaction]);
      const result = await service.filterTransactions({});
      expect(result).toEqual([mockTransaction]);
    });
  });
});
