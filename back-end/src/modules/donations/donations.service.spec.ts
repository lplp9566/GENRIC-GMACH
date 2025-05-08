import { Test, TestingModule } from '@nestjs/testing';
import { DonationsService } from './donations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DonationsEntity } from './donations.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UserEntity } from '../users/user.entity';
import { PaymentDetailsEntity } from '../users/payment-details/payment_details.entity';
import { UserFinancialEntity } from '../users/user-financials/user-financials.entity';
import { UserRole } from '../users/userTypes';
import { DonationActionType } from './donationsTypes';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';

const mockDonationRepo = () => ({
  find: jest.fn(),
  save: jest.fn(),
});

describe('DonationsService', () => {
  let service: DonationsService;
  let donationRepo: jest.Mocked<Repository<DonationsEntity>>;
  const mockUser: UserEntity = {
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    join_date: new Date(),
    password: 'pass',
    id_number: '123456789',
    email_address: 'test@example.com',
    phone_number: '0501234567',
    role: UserRole.committeeMember,
    is_admin: false,
    payment_details: {} as PaymentDetailsEntity,
    loans: [],
    financialHistoryByYear: [],
    userFinancials: {} as UserFinancialEntity,
    monthly_deposits: [],
    donations: [],
    requests: [],
    cashHoldings: [],
    orderReturns :[] 
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: getRepositoryToken(DonationsEntity), useFactory: mockDonationRepo },
        { provide: FundsOverviewByYearService,useValue: FundsOverviewByYearService },
        { provide: UsersService, useValue: { getUserById: jest.fn().mockResolvedValue(mockUser) } },
        { provide: UserFinancialByYearService, useValue: {
          recordEquityDonation: jest.fn(),
          recordSpecialFundDonation: jest.fn()
        } },
        { provide: UserFinancialsService, useValue: {
          recordEquityDonation: jest.fn(),
          recordSpecialFundDonation: jest.fn()
        } },
        { provide: FundsOverviewService, useValue: {
          addDonation: jest.fn(),
          addSpecialFund: jest.fn()
        } },
        
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
    donationRepo = module.get(getRepositoryToken(DonationsEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all donations', async () => {
    const donations = [{ id: 1 }] as any;
    donationRepo.find.mockResolvedValue(donations);
    const result = await service.getDonations();
    expect(result).toEqual(donations);
  });

  it('should create equity donation flow', async () => {
    const donation: DonationsEntity = {
      id: 1,
      user: mockUser,
      date: new Date(),
      amount: 100,
      donation_reason: 'Equity',
      action:DonationActionType.donation,
    };
    donationRepo.save = jest.fn().mockResolvedValue(donation);
    const result = await service.createDonation(donation);
    expect(result).toEqual(donation);
  });

  it('should create fund donation flow', async () => {
    const donation: DonationsEntity = {
      id: 1,
      user: mockUser,
      date: new Date(),
      amount: 150,
      donation_reason: 'SpecialFund',
      action: DonationActionType.donation,
    };
    donationRepo.save = jest.fn().mockResolvedValue(donation);
    const result = await service.createDonation(donation);
    expect(result).toEqual(donation);
  });
});
