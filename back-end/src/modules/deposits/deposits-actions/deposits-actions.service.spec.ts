import { Test, TestingModule } from '@nestjs/testing';
import { DepositsActionsService } from './deposits-actions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DepositsActionsEntity } from './deposits-actions.entity';
import { DepositsEntity } from '../deposits.entity';
import { Repository } from 'typeorm';
import { DepositsService } from '../deposits.service';
import { DepositActionsType, IDepositAction } from './depostits-actions-dto';

function createMockDepositAction(partial: Partial<DepositsActionsEntity> = {}): DepositsActionsEntity {
  return {
    id: partial.id ?? 1,
    deposit: partial.deposit ?? ({ id: 1 } as DepositsEntity),
    date: partial.date ?? new Date(),
    action_type: partial.action_type ?? DepositActionsType.ChangeReturnDate,
    amount: partial.amount,
    update_date: partial.update_date,
  };
}

describe('DepositsActionsService', () => {
  let service: DepositsActionsService;
  let depositsActionsRepo: jest.Mocked<Repository<DepositsActionsEntity>>;
  let depositsRepo: jest.Mocked<Repository<DepositsEntity>>;
  let depositsService: jest.Mocked<DepositsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositsActionsService,
        {
          provide: getRepositoryToken(DepositsActionsEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DepositsEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DepositsService,
          useValue: {
            editEndDate: jest.fn(),
            withdrawDeposit: jest.fn(),
            getDepositsActive: jest.fn().mockResolvedValue([
              { id: 1, current_balance: 1000, isActive: true } as DepositsEntity,
            ]),
          },
        },
      ],
    }).compile();

    service = module.get<DepositsActionsService>(DepositsActionsService);
    depositsActionsRepo = module.get(getRepositoryToken(DepositsActionsEntity));
    depositsRepo = module.get(getRepositoryToken(DepositsEntity));
    depositsService = module.get(DepositsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle ChangeReturnDate action correctly', async () => {
    const mockDeposit = { id: 1, user: {} } as DepositsEntity;
    const dto: IDepositAction = {
      deposit: 1,
      date: new Date(),
      update_date: new Date('2030-01-01'),
      action_type: DepositActionsType.ChangeReturnDate,
    };

    depositsRepo.findOne.mockResolvedValue(mockDeposit);
    depositsActionsRepo.create.mockReturnValue(
      createMockDepositAction({ update_date: dto.update_date, date: dto.date, action_type: dto.action_type }),
    );
    depositsActionsRepo.save.mockResolvedValue({ id: 10 } as DepositsActionsEntity);

    const result = await service.createDepositAction(dto);

    expect(depositsService.editEndDate).toHaveBeenCalledWith(1, dto.update_date);
    expect(depositsActionsRepo.save).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, current_balance: 1000, isActive: true }]);
  });

  it('should handle RemoveFromDeposit action correctly', async () => {
    const mockDeposit = { id: 1, user: {} } as DepositsEntity;
    const dto: IDepositAction = {
      deposit: 1,
      date: new Date(),
      amount: 250,
      action_type: DepositActionsType.RemoveFromDeposit,
    };

    depositsRepo.findOne.mockResolvedValue(mockDeposit);
    depositsActionsRepo.create.mockReturnValue(
      createMockDepositAction({ amount: dto.amount, date: dto.date, action_type: dto.action_type }),
    );
    depositsActionsRepo.save.mockResolvedValue({ id: 11 } as DepositsActionsEntity);

    const result = await service.createDepositAction(dto);

    expect(depositsService.withdrawDeposit).toHaveBeenCalledWith(mockDeposit, 250, dto.date);
    expect(depositsActionsRepo.save).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, current_balance: 1000, isActive: true }]);
  });

  it('should throw if deposit is not found', async () => {
    depositsRepo.findOne.mockResolvedValue(null);
    const dto: IDepositAction = {
      deposit: 999,
      date: new Date(),
      action_type: DepositActionsType.ChangeReturnDate,
      update_date: new Date(),
    };
    await expect(service.createDepositAction(dto)).rejects.toThrow('Deposit not found');
  });

  it('should throw if update_date is missing on ChangeReturnDate', async () => {
    depositsRepo.findOne.mockResolvedValue({ id: 1 } as DepositsEntity);
    const dto: IDepositAction = {
      deposit: 1,
      date: new Date(),
      action_type: DepositActionsType.ChangeReturnDate,
    };
    await expect(service.createDepositAction(dto)).rejects.toThrow('Update date not found');
  });

  it('should throw if amount is missing on RemoveFromDeposit', async () => {
    depositsRepo.findOne.mockResolvedValue({ id: 1 } as DepositsEntity);
    const dto: IDepositAction = {
      deposit: 1,
      date: new Date(),
      action_type: DepositActionsType.RemoveFromDeposit,
    };
    await expect(service.createDepositAction(dto)).rejects.toThrow('Amount not found');
  });
});
