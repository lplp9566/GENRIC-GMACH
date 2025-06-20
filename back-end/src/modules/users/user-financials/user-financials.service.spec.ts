import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentDetailsEntity } from '../payment-details/payment_details.entity';
import { UsersService } from '../users.service';
import { UserEntity } from '../user.entity';
import { MembershipRoleEntity } from '../../membership_roles/Entity/membership_rols.entity';
import { UserRoleHistoryEntity } from '../../user_role_history/Entity/user_role_history.entity';
import { RoleMonthlyRateEntity } from '../../role_monthly_rates/Entity/role_monthly_rates.entity';
import { MonthlyDepositsService } from '../../monthly_deposits/monthly_deposits.service';
import { UserRoleHistoryService } from '../../user_role_history/user_role_history.service';



// --- Mock factories ---
const mockUserRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockMembershipRoleRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
});

const mockPaymentRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockUserRoleHistoryRepo = () => ({
  find: jest.fn(),
});

const mockRoleMonthlyRateRepo = () => ({
  find: jest.fn(),
});

const mockDepositsService = () => ({
  getUserTotalDeposits: jest.fn(),
});

const mockUserRoleHistoryService = () => ({
  // כאן תוסיפו מתודות לפי הצורך
  someMethod: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<UserEntity>>;
  let paymentRepo: jest.Mocked<Repository<PaymentDetailsEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,

        // repositories
        { provide: getRepositoryToken(UserEntity), useFactory: mockUserRepo },
        { provide: getRepositoryToken(MembershipRoleEntity), useFactory: mockMembershipRoleRepo },
        { provide: getRepositoryToken(PaymentDetailsEntity), useFactory: mockPaymentRepo },
        { provide: getRepositoryToken(UserRoleHistoryEntity), useFactory: mockUserRoleHistoryRepo },
        { provide: getRepositoryToken(RoleMonthlyRateEntity), useFactory: mockRoleMonthlyRateRepo },

        // services
        { provide: MonthlyDepositsService, useFactory: mockDepositsService },
        { provide: UserRoleHistoryService, useFactory: mockUserRoleHistoryService },
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
