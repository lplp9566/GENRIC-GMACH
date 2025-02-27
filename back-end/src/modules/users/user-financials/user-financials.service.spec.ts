import { Test, TestingModule } from '@nestjs/testing';
import { UserFinancialsService } from './user-financials.service';

describe('UserFinancialsService', () => {
  let service: UserFinancialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserFinancialsService],
    }).compile();

    service = module.get<UserFinancialsService>(UserFinancialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
