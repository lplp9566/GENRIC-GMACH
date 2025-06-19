import { Test, TestingModule } from '@nestjs/testing';
import { MembershipRolesService } from './membership_roles.service';

describe('MembershipRolesService', () => {
  let service: MembershipRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembershipRolesService],
    }).compile();

    service = module.get<MembershipRolesService>(MembershipRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
