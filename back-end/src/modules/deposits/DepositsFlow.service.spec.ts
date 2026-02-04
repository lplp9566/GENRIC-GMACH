import { Test, TestingModule } from '@nestjs/testing';
import { DepositsFlowService } from './DepositsFlow.service';

describe('DepositsFlowService', () => {
  let service: DepositsFlowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: DepositsFlowService, useValue: {} }],
    }).compile();

    service = module.get<DepositsFlowService>(DepositsFlowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
