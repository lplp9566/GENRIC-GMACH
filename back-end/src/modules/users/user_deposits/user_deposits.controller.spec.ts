import { Test, TestingModule } from '@nestjs/testing';
import { UserDepositsController } from './user_deposits.controller';

describe('UserDepositsController', () => {
  let controller: UserDepositsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDepositsController],
    }).compile();

    controller = module.get<UserDepositsController>(UserDepositsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
