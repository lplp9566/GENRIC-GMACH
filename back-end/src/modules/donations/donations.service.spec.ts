import { Test, TestingModule } from '@nestjs/testing';
import { DonationsService } from './donations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { UserFinancialService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';
import { UserEntity } from '../users/user.entity';
import { PaymentDetailsEntity } from '../users/payment-details/payment_details.entity';
import { UserFinancialEntity } from '../users/user-financials/user-financials.entity';
import { DonationActionType } from './donations_dto';
import { DonationsEntity } from './Entity/donations.entity';
import { MembershipType } from '../users/userTypes';

const mockDonationRepo = () => ({
  find: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
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
    is_admin: false,
    payment_details: {} as PaymentDetailsEntity,
    loans: [],
    membership_type: MembershipType.MEMBER,
    financialHistoryByYear: [],
    userFinancials: {} as UserFinancialEntity,
    monthly_deposits: [],
    donations: [],
    requests: [],
    cashHoldings: [],
    orderReturns: [],
    deposits: [],
    current_role: { id: 1, name: 'Member',monthlyRates:[] },
    roleHistory: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: getRepositoryToken(DonationsEntity), useFactory: mockDonationRepo },
        {
          provide: UsersService,
          useValue: { getUserById: jest.fn().mockResolvedValue(mockUser) },
        },
        {
          provide: UserFinancialByYearService,
          useValue: {
            recordEquityDonation: jest.fn(),
            recordSpecialFundDonation: jest.fn(),
            recordSpecialFundWithdrawalByName: jest.fn(),
          },
        },
        {
          provide: UserFinancialService,
          useValue: {
            recordEquityDonation: jest.fn(),
            recordSpecialFundDonation: jest.fn(),
          },
        },
        {
          provide: FundsOverviewService,
          useValue: {
            addDonation: jest.fn(),
            addSpecialFund: jest.fn(),
            reduceFundAmount: jest.fn(),
          },
        },
        {
          provide: FundsOverviewByYearService,
          useValue: {
            recordEquityDonation: jest.fn(),
            recordSpecialFundDonationByName: jest.fn(),
            recordSpecialFundWithdrawalByName: jest.fn(),
          },
        },
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

//  it('should create equity donation flow', async () => {
//   const donation: DonationsEntity = {
//     id: 1,
//     user: mockUser as any,
//     date: new Date(),
//     amount: 100,
//     donation_reason: 'Equity',
//     action: DonationActionType.donation,
//   };

//   donationRepo.save.mockResolvedValue(donation);
//   donationRepo.findOne.mockResolvedValue({ ...donation, user: mockUser }); // ← החזרת הרשומה עם user

//   const result = await service.createDonation(donation);

//   expect(donationRepo.save).toHaveBeenCalledWith(donation);
//   expect(donationRepo.findOne).toHaveBeenCalledWith({
//     where: { id: donation.id },
//     relations: { user: true },
//   });
//   expect(result).toEqual({ ...donation, user: mockUser });
// });

//   it('should create fund donation flow', async () => {
//   const donation: DonationsEntity = {
//     id: 1,
//     user: mockUser as any,
//     date: new Date(),
//     amount: 150,
//     donation_reason: 'SpecialFund',
//     action: DonationActionType.donation,
//   };

//   donationRepo.save.mockResolvedValue(donation);
//   donationRepo.findOne.mockResolvedValue({ ...donation, user: mockUser });

//   const result = await service.createDonation(donation);

//   expect(donationRepo.save).toHaveBeenCalledWith(donation);
//   expect(donationRepo.findOne).toHaveBeenCalled();
//   expect(result).toEqual({ ...donation, user: mockUser });
// });

it('should handle fund withdrawal flow', async () => {
  const donation: DonationsEntity = {
    id: 1,
    user: mockUser as any,
    date: new Date(),
    amount: 200,
    donation_reason: 'CampFund',
    action: DonationActionType.withdraw,
  };

  donationRepo.save.mockResolvedValue(donation);
  donationRepo.findOne.mockResolvedValue({ ...donation, user: mockUser });

  const result = await service.createDonation(donation);

  expect(donationRepo.save).toHaveBeenCalledWith(donation);
  expect(donationRepo.findOne).toHaveBeenCalled();
  expect(result).toEqual({ ...donation, user: mockUser });
});


  it('should throw if user not found', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: getRepositoryToken(DonationsEntity), useFactory: mockDonationRepo },
        { provide: UsersService, useValue: { getUserById: jest.fn().mockResolvedValue(null) } },
        { provide: UserFinancialByYearService, useValue: {} },
        { provide: UserFinancialService, useValue: {} },
        { provide: FundsOverviewService, useValue: {} },
        { provide: FundsOverviewByYearService, useValue: {} },
      ],
    }).compile();

    const localService = module.get<DonationsService>(DonationsService);
    const badDonation: DonationsEntity = {
      id: 1,
      user: null as any,
      date: new Date(),
      amount: 200,
      donation_reason: 'Equity',
      action: DonationActionType.donation,
    };

    await expect(localService.createDonation(badDonation)).rejects.toThrow('User not found');
  });
});
