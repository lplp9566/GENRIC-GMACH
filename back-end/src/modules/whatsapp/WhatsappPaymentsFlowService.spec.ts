import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappPaymentsFlowService } from './WhatsappPaymentsFlowService';

describe('WhatsappPaymentsFlowService', () => {
  let service: WhatsappPaymentsFlowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: WhatsappPaymentsFlowService, useValue: {} }],
    }).compile();

    service = module.get<WhatsappPaymentsFlowService>(WhatsappPaymentsFlowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
