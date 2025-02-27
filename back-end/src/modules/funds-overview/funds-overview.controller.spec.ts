import { Test, TestingModule } from '@nestjs/testing';
import { FundsOverviewController } from './funds-overview.controller';

describe('FundsOverviewController', () => {
  let controller: FundsOverviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundsOverviewController],
    }).compile();

    controller = module.get<FundsOverviewController>(FundsOverviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should return an array of funds', async () => {
    expect(await controller.getFundsOverview()).toBeInstanceOf(Array);
  });
  it('should return an array of funds', async () => {
    expect(await controller.getFundsOverview()).toHaveLength(0);
  });
});
