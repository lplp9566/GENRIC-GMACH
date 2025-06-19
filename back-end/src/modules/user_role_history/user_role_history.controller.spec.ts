import { Test, TestingModule } from '@nestjs/testing';
import { UserRoleHistoryController } from './user_role_history.controller';

describe('UserRoleHistoryController', () => {
  let controller: UserRoleHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRoleHistoryController],
    }).compile();

    controller = module.get<UserRoleHistoryController>(UserRoleHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
