import { Test, TestingModule } from '@nestjs/testing';
import { UserFinancialsController } from './user-financials.controller';

describe('UserFinancialsController', () => {
  let controller: UserFinancialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFinancialsController],
    }).compile();

    controller = module.get<UserFinancialsController>(UserFinancialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
