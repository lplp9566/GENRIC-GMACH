import { Test, TestingModule } from '@nestjs/testing';
import { DbToolsService } from './db-tools.service';

describe('DbToolsService', () => {
  let service: DbToolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: DbToolsService, useValue: {} }],
    }).compile();

    service = module.get<DbToolsService>(DbToolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
