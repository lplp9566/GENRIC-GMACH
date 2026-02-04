import { Test, TestingModule } from '@nestjs/testing';
import { QueryResolverService } from './query-resolver.service';

describe('QueryResolverService', () => {
  let service: QueryResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: QueryResolverService, useValue: {} }],
    }).compile();

    service = module.get<QueryResolverService>(QueryResolverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
