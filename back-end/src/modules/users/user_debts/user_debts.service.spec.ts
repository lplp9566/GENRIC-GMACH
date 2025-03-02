import { Test, TestingModule } from '@nestjs/testing';
import { UserDebtsService } from './user_debts.service';

describe('UserDebtsService', () => {
  let service: UserDebtsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDebtsService],
    }).compile();

    service = module.get<UserDebtsService>(UserDebtsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
