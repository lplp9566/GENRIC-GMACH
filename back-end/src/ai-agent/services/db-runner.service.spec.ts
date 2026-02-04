import { Test, TestingModule } from '@nestjs/testing';
import { DbRunnerService } from './db-runner.service';

describe('DbRunnerService', () => {
  let service: DbRunnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: DbRunnerService, useValue: {} }],
    }).compile();

    service = module.get<DbRunnerService>(DbRunnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
