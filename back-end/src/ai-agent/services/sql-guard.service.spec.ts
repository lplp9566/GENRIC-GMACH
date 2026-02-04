import { Test, TestingModule } from '@nestjs/testing';
import { SqlGuardService } from './sql-guard.service';

describe('SqlGuardService', () => {
  let service: SqlGuardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: SqlGuardService, useValue: {} }],
    }).compile();

    service = module.get<SqlGuardService>(SqlGuardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
