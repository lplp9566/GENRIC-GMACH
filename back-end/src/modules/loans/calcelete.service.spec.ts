import { Test, TestingModule } from '@nestjs/testing';
import { FundsFlowService } from './calcelete.service';

describe('FundsFlowService', () => {
  let service: FundsFlowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: FundsFlowService, useValue: {} }],
    }).compile();

    service = module.get<FundsFlowService>(FundsFlowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
