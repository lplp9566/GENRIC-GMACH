import { Test, TestingModule } from '@nestjs/testing';
import { RegulationService } from './regulation.service';

describe('RegulationService', () => {
  let service: RegulationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: RegulationService, useValue: {} }],
    }).compile();

    service = module.get<RegulationService>(RegulationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
