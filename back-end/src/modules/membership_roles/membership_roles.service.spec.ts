// src/membership_roles/membership_roles.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MembershipRolesService } from './membership_roles.service';
import { MembershipRoleEntity } from './Entity/membership_rols.entity';

import { ObjectLiteral } from 'typeorm';

type MockRepo<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('MembershipRolesService', () => {
  let service: MembershipRolesService;
  let repo: MockRepo<MembershipRoleEntity> & { save: jest.Mock; find: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipRolesService,
        {
          provide: getRepositoryToken(MembershipRoleEntity),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<MembershipRolesService>(MembershipRolesService);
  });

  describe('getAllMemberShip', () => {
    it('should return an array of roles', async () => {
      const roles = [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }] as MembershipRoleEntity[];
      repo.find.mockResolvedValue(roles);

      const result = await service.getAllMemberShip();
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(roles);
    });
  });

  describe('createMemberShip', () => {
    it('should save and return the new role', async () => {
      const dtoName = 'new-role';
      const saved = { id: 3, name: dtoName } as MembershipRoleEntity;
      repo.save.mockResolvedValue(saved);

      const result = await service.createMemberShip(dtoName);
      expect(repo.save).toHaveBeenCalledWith({ name: dtoName });
      expect(result).toEqual(saved);
    });
  });

  describe('findById', () => {
    it('should return a role when found', async () => {
      const role = { id: 5, name: 'baz' } as MembershipRoleEntity;
      repo.findOne.mockResolvedValue(role);

      const result = await service.findById(5);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(result).toEqual(role);
    });

    it('should return null if not found', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.findById(999);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBeNull();
    });
  });
});
