import { Test, TestingModule } from '@nestjs/testing';
import { RoleMonthlyRatesController } from './role_monthly_rates.controller';

describe('RoleMonthlyRatesController', () => {
  let controller: RoleMonthlyRatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleMonthlyRatesController],
    }).compile();

    controller = module.get<RoleMonthlyRatesController>(RoleMonthlyRatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
