import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoanRequestsService } from './loan-requests.service';
import { LoanRequestEntity, LoanRequestStatus } from './loan-request.entity';
import { LoanGuarantorRequestEntity } from './loan-request-guarantor.entity';
import { UserEntity } from '../users/user.entity';
import { LoansService } from '../loans/loans.service';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
});

describe('LoanRequestsService', () => {
  let service: LoanRequestsService;
  let requestsRepo: jest.Mocked<Repository<LoanRequestEntity>>;
  let guarantorRepo: jest.Mocked<Repository<LoanGuarantorRequestEntity>>;
  let usersRepo: jest.Mocked<Repository<UserEntity>>;
  let loansService: { checkLoan: jest.Mock; createLoan: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanRequestsService,
        { provide: getRepositoryToken(LoanRequestEntity), useFactory: mockRepo },
        {
          provide: getRepositoryToken(LoanGuarantorRequestEntity),
          useFactory: mockRepo,
        },
        { provide: getRepositoryToken(UserEntity), useFactory: mockRepo },
        { provide: LoansService, useValue: { checkLoan: jest.fn(), createLoan: jest.fn() } },
      ],
    }).compile();

    service = module.get<LoanRequestsService>(LoanRequestsService);
    requestsRepo = module.get(getRepositoryToken(LoanRequestEntity));
    guarantorRepo = module.get(getRepositoryToken(LoanGuarantorRequestEntity));
    usersRepo = module.get(getRepositoryToken(UserEntity));
    loansService = module.get(LoansService);
  });

  describe('createRequest', () => {
    it('throws if user not found', async () => {
      usersRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createRequest({ userId: 1, amount: 100, monthly_payment: 10 })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns null request when check fails', async () => {
      usersRepo.findOne.mockResolvedValue({ id: 1, is_member: true } as any);
      loansService.checkLoan.mockResolvedValue({ ok: false, error: 'no', butten: false });

      const result = await service.createRequest({
        userId: 1,
        amount: 100,
        monthly_payment: 10,
      });

      expect(result.request).toBeNull();
      expect(result.check.ok).toBe(false);
    });

    it('sets ADMIN_PENDING when member has details', async () => {
      usersRepo.findOne.mockResolvedValue({ id: 1, is_member: true } as any);
      loansService.checkLoan.mockResolvedValue({ ok: true, error: '', butten: true });
      requestsRepo.create.mockImplementation((v: any) => ({ ...v }));
      requestsRepo.save.mockImplementation(async (v: any) => ({ ...v, id: 5 }));

      const result = await service.createRequest({
        userId: 1,
        amount: 100,
        monthly_payment: 10,
        purpose: 'x',
        payment_date: 1,
        payment_method: 'bank_transfer' as any,
      });

      expect(result.request?.status).toBe(LoanRequestStatus.ADMIN_PENDING);
    });
  });

  describe('adminApprove', () => {
    it('marks CHECK_FAILED and throws when check fails', async () => {
      const request = {
        id: 1,
        user: { id: 10 },
        amount: 100,
        monthly_payment: 10,
        payment_date: 1,
        guarantor_requests: [],
      } as any;
      requestsRepo.findOne.mockResolvedValue(request);
      usersRepo.findOne.mockResolvedValue({ id: 10 } as any);
      loansService.checkLoan.mockResolvedValue({ ok: false, error: 'no', butten: false });
      requestsRepo.save.mockResolvedValue({ ...request, status: LoanRequestStatus.CHECK_FAILED });

      await expect(service.adminApprove(1)).rejects.toBeInstanceOf(BadRequestException);
      expect(requestsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: LoanRequestStatus.CHECK_FAILED,
          error_message: 'no',
        })
      );
    });
  });
});
