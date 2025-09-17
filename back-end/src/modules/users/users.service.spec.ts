import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { UserRoleHistoryEntity } from '../user_role_history/Entity/user_role_history.entity';
import { MembershipRoleEntity } from '../membership_roles/Entity/membership_rols.entity';
import { RoleMonthlyRateEntity } from '../role_monthly_rates/Entity/role_monthly_rates.entity';
import { MonthlyDepositsService } from '../monthly_deposits/monthly_deposits.service';
import { UserRoleHistoryService } from '../user_role_history/user_role_history.service';
import { ConfigService } from '@nestjs/config';

// --------- Repos Mocks for constructor-injected repositories ----------
const mockUserRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});
const mockPaymentRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
});
const mockMembershipRoleRepo = () => ({ findOne: jest.fn(), find: jest.fn() });
const mockUserRoleHistoryRepo = () => ({ find: jest.fn() });
const mockRatesRepo = () => ({ find: jest.fn() });

// --------- Other services ----------
const mockMonthlyDepositsService = () => ({
  getUserTotalDeposits: jest.fn(),
});
const mockUserRoleHistoryService = () => ({
  createUserRoleHistory: jest.fn(),
});

// --------- ConfigService mock ----------
const mockConfigService: Partial<ConfigService> = {
  get: jest.fn((key: string) => {
    // החזר כאן ערכים אם ה־UsersService מצפה למפתחות מסוימים
    // דוגמה:
    // if (key === 'FEATURE_FLAGS.enableSomething') return true;
    return undefined;
  }),
};

// --------- DataSource mock tailored to updateUserAndPaymentInfo ----------
function buildDataSourceMockForTx(repoMap: Map<any, any>) {
  return {
    transaction: jest.fn(async (cb: any) =>
      cb({
        getRepository: (entity: any) => {
          const repo = repoMap.get(entity);
          if (!repo) {
            throw new Error(`Repo not mocked for entity: ${entity?.name}`);
          }
          return repo;
        },
      })
    ),
  } as unknown as DataSource;
}

describe('UsersService', () => {
  let service: UsersService;

  // constructor-injected repos (שאינם טרנזקציוניים)
  let userRepo: jest.Mocked<Repository<UserEntity>>;
  let paymentRepo: jest.Mocked<Repository<PaymentDetailsEntity>>;
  let roleHistoryRepo: jest.Mocked<Repository<UserRoleHistoryEntity>>;
  let membershipRoleRepo: jest.Mocked<Repository<MembershipRoleEntity>>;
  let ratesRepo: jest.Mocked<Repository<RoleMonthlyRateEntity>>;

  // repos שיעבדו בתוך הטרנזקציה (manager.getRepository)
  let usersRepoTx: any;
  let paymentRepoTx: any;

  // DataSource mock
  let dataSourceMock: DataSource;

  beforeEach(async () => {
    // טרנזקציה: ריפוזיטוריז בגרסת "Tx"
    usersRepoTx = {
      findOne: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
    };
    paymentRepoTx = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
    };

    const txRepoMap = new Map<any, any>([
      [UserEntity, usersRepoTx],
      [PaymentDetailsEntity, paymentRepoTx],
    ]);

    dataSourceMock = buildDataSourceMockForTx(txRepoMap);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,

        // repos שנכנסים דרך ה-constructor
        { provide: getRepositoryToken(UserEntity), useFactory: mockUserRepo },
        { provide: getRepositoryToken(PaymentDetailsEntity), useFactory: mockPaymentRepo },
        { provide: getRepositoryToken(UserRoleHistoryEntity), useFactory: mockUserRoleHistoryRepo },
        { provide: getRepositoryToken(MembershipRoleEntity), useFactory: mockMembershipRoleRepo },
        { provide: getRepositoryToken(RoleMonthlyRateEntity), useFactory: mockRatesRepo },

        // services נוספים
        { provide: MonthlyDepositsService, useFactory: mockMonthlyDepositsService },
        { provide: UserRoleHistoryService, useFactory: mockUserRoleHistoryService },

        // DataSource
        { provide: DataSource, useValue: dataSourceMock },

        // ConfigService
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(UserEntity));
    paymentRepo = module.get(getRepositoryToken(PaymentDetailsEntity));
    roleHistoryRepo = module.get(getRepositoryToken(UserRoleHistoryEntity));
    membershipRoleRepo = module.get(getRepositoryToken(MembershipRoleEntity));
    ratesRepo = module.get(getRepositoryToken(RoleMonthlyRateEntity));
  });

  describe('getUserById', () => {
    it('מחזיר יוזר כשנמצא', async () => {
      const mockUser = { id: 1 } as any;
      userRepo.findOne.mockResolvedValue(mockUser);

      const res = await service.getUserById(1);
      expect(res).toEqual(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1, is_admin: false },
        relations: ['payment_details'],
      });
    });

    it('זורק שגיאה כשלא נמצא', async () => {
      userRepo.findOne.mockResolvedValue(null as any);
      await expect(service.getUserById(999)).rejects.toThrow('User not found');
    });
  });

  describe('updateUserAndPaymentInfo', () => {
    it('מעדכן חלקית את המשתמש ויוצר/מעדכן פרטי תשלום בתוך טרנזקציה', async () => {
      // מצב התחלתי: יש משתמש בלי payment_details
      const existingUser = { id: 10, first_name: 'Eli', payment_details: null } as any;

      // שלב הטעינה בתחילת הטרנזקציה
      usersRepoTx.findOne.mockResolvedValueOnce(existingUser);
      usersRepoTx.merge.mockImplementation((target: any, patch: any) => Object.assign(target, patch));
      usersRepoTx.save.mockImplementation(async (u: any) => u);

      const createdPayment = { id: 100, iban: 'IL00', user: existingUser } as any;
      paymentRepoTx.create.mockImplementation((dto: any) => dto);
      paymentRepoTx.save.mockResolvedValue(createdPayment);

      // אחרי השמירות, השירות טוען מחדש את המשתמש
      const userAfter = { ...existingUser, payment_details: createdPayment } as any;
      usersRepoTx.findOne.mockResolvedValueOnce(userAfter);

      const result = await service.updateUserAndPaymentInfo(
        10,
        { first_name: 'Eli' },
        { iban: 'IL00' } as any
      );

      expect(result.first_name).toBe('Eli');
      expect(result.payment_details).toEqual(createdPayment);

      // ווידוא שהתבצעה טרנזקציה
      expect((dataSourceMock as any).transaction).toHaveBeenCalledTimes(1);

      // ווידוא שהריפוזיטוריז הטרנזקציוניים נקראו
      expect(usersRepoTx.findOne).toHaveBeenCalledTimes(2);
      expect(usersRepoTx.merge).toHaveBeenCalled();
      expect(usersRepoTx.save).toHaveBeenCalled();

      expect(paymentRepoTx.create).toHaveBeenCalledWith({ iban: 'IL00', user: existingUser });
      expect(paymentRepoTx.save).toHaveBeenCalled();
    });
  });
});
