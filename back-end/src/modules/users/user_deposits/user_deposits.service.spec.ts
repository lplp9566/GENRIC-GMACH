import { Test, TestingModule } from '@nestjs/testing';
import { UserDepositsService } from './user_deposits.service';

describe('UserDepositsService', () => {
  let service: UserDepositsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDepositsService],
    }).compile();

    service = module.get<UserDepositsService>(UserDepositsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
