import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentDetailsEntity } from './payment_details.entity';
import { PaymentDetailsService } from './payment-details.service';
import { payment_method } from '../userTypes';

const mockRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

describe('PaymentDetailsService', () => {
  let service: PaymentDetailsService;
  let repo: jest.Mocked<Repository<PaymentDetailsEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentDetailsService,
        {
          provide: getRepositoryToken(PaymentDetailsEntity),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get<PaymentDetailsService>(PaymentDetailsService);
    repo = module.get(getRepositoryToken(PaymentDetailsEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mock basic findOne', () => {
    it('should return a payment details entity', async () => {
      const mockDetails: PaymentDetailsEntity = {
        id: 1,
        user: {} as any,
        bank_number: 10,
        bank_branch: 123,
        bank_account_number: 456789,
        charge_date: '15',
        payment_method: payment_method.bank_transfer,
        monthly_balance: 0,
        loan_balances: [],
      };
      repo.findOne.mockResolvedValue(mockDetails);

      const result = await repo.findOne({ where: { id: 1 } });
      expect(result).toEqual(mockDetails);
    });
  });
});
