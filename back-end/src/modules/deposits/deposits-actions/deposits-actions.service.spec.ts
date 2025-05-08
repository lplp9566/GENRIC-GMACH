import { Test, TestingModule } from '@nestjs/testing';
import { DepositsActionsService } from './deposits-actions.service';

describe('DepositsActionsService', () => {
  let service: DepositsActionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepositsActionsService],
    }).compile();

    service = module.get<DepositsActionsService>(DepositsActionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
