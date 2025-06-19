import { Test, TestingModule } from '@nestjs/testing';
import { UserRoleHistoryService } from './user_role_history.service';

describe('UserRoleHistoryService', () => {
  let service: UserRoleHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRoleHistoryService],
    }).compile();

    service = module.get<UserRoleHistoryService>(UserRoleHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
