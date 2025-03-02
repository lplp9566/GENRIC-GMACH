import { Test, TestingModule } from '@nestjs/testing';
import { UserDebtsController } from './user_debts.controller';

describe('UserDebtsController', () => {
  let controller: UserDebtsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDebtsController],
    }).compile();

    controller = module.get<UserDebtsController>(UserDebtsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
