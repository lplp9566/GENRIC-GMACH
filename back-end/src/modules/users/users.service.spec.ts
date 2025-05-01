import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { MonthlyDepositsService } from '../monthly_deposits/monthly_deposits.service';
import { MonthlyRatesService } from '../monthly_rates/monthly_rates.service';
import { Repository } from 'typeorm';

const mockUserRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockPaymentRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockDepositsService = () => ({
  getUserTotalDeposits: jest.fn(),
});

const mockRatesService = () => ({
  getRatesForRole: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<UserEntity>>;
  let paymentRepo: jest.Mocked<Repository<PaymentDetailsEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useFactory: mockUserRepo },
        { provide: getRepositoryToken(PaymentDetailsEntity), useFactory: mockPaymentRepo },
        { provide: MonthlyDepositsService, useFactory: mockDepositsService },
        { provide: MonthlyRatesService, useFactory: mockRatesService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(UserEntity));
    paymentRepo = module.get(getRepositoryToken(PaymentDetailsEntity));
  });

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: 1 } as any;
      userRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.getUserById(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.getUserById(999)).rejects.toThrow('User not found');
    });
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers = [{ id: 1 }, { id: 2 }] as any[];
      userRepo.find.mockResolvedValue(mockUsers);
      const result = await service.getAllUsers();
      expect(result).toEqual(mockUsers);
    });
  });
});