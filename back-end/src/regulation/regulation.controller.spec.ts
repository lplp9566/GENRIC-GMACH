import { Test, TestingModule } from '@nestjs/testing';
import { RegulationController } from './regulation.controller';

describe('RegulationController', () => {
  let controller: RegulationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegulationController],
    }).compile();

    controller = module.get<RegulationController>(RegulationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
