import { Test, TestingModule } from '@nestjs/testing';
import { MembershipRolesController } from './membership_roles.controller';

describe('MembershipRolesController', () => {
  let controller: MembershipRolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipRolesController],
    }).compile();

    controller = module.get<MembershipRolesController>(MembershipRolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
