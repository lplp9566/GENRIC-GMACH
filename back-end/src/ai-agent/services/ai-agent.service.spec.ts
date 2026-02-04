import { Test, TestingModule } from '@nestjs/testing';
import { AiAgentService } from './ai-agent.service';

describe('AiAgentService', () => {
  let service: AiAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: AiAgentService, useValue: {} }],
    }).compile();

    service = module.get<AiAgentService>(AiAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
