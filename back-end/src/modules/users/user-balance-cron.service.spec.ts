import { Test, TestingModule } from '@nestjs/testing';
import { UserBalanceCronService } from './user-balance-cron.service';

describe('UserBalanceCronService', () => {
  let service: UserBalanceCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: UserBalanceCronService, useValue: {} }],
    }).compile();

    service = module.get<UserBalanceCronService>(UserBalanceCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
