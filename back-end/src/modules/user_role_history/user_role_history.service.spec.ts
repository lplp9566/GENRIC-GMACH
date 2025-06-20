// src/user_role_history/user_role_history.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import { UserRoleHistoryService } from './user_role_history.service';
import { UserRoleHistoryEntity } from './Entity/user_role_history.entity';
import { UserEntity } from '../users/user.entity';
import { MembershipRolesService } from '../membership_roles/membership_roles.service';
import { UsersService } from '../users/users.service';

import { ObjectLiteral } from 'typeorm';

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserRoleHistoryService', () => {
  let service: UserRoleHistoryService;
  let historyRepo: MockRepository<UserRoleHistoryEntity> & { create: jest.Mock; save: jest.Mock; find: jest.Mock };
  let userRepo: MockRepository<UserEntity> & { findOne: jest.Mock };
  let usersService: Partial<UsersService> & { setCurrentRole: jest.Mock; getUserById: jest.Mock };
  let membershipRolesService: Partial<MembershipRolesService> & { findById: jest.Mock };

  beforeEach(async () => {
    historyRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    userRepo = {
      findOne: jest.fn(),
    };
    usersService = {
      setCurrentRole: jest.fn(),
      getUserById: jest.fn(),
    };
    membershipRolesService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRoleHistoryService,
        { provide: getRepositoryToken(UserRoleHistoryEntity), useValue: historyRepo },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: UsersService, useValue: usersService },
        { provide: MembershipRolesService, useValue: membershipRolesService },
      ],
    }).compile();

    service = module.get<UserRoleHistoryService>(UserRoleHistoryService);
  });

  describe('createUserRoleHistory', () => {
    const dto = { userId: 42, roleId: 7, from_date: new Date('2025-06-01') };

    it('throws if user not found', async () => {
      userRepo.findOne.mockResolvedValue(undefined);
      await expect(service.createUserRoleHistory(dto))
        .rejects
        .toBeInstanceOf(BadRequestException);
    });

    it('throws if role not found', async () => {
      userRepo.findOne.mockResolvedValue({ id: dto.userId } as UserEntity);
      membershipRolesService.findById.mockResolvedValue(undefined);
      await expect(service.createUserRoleHistory(dto))
        .rejects
        .toBeInstanceOf(BadRequestException);
    });

    it('creates and saves a history record', async () => {
      const user = { id: dto.userId } as UserEntity;
      const role = { id: dto.roleId, name: 'Test' } as any;
      const created = { ...dto, user, role, id: 0 } as UserRoleHistoryEntity;
      const saved = { ...created, id: 100 } as UserRoleHistoryEntity;

      userRepo.findOne.mockResolvedValue(user);
      membershipRolesService.findById.mockResolvedValue(role);
      historyRepo.create.mockReturnValue(created);
      historyRepo.save.mockResolvedValue(saved);

      const result = await service.createUserRoleHistory(dto);
      expect(usersService.setCurrentRole).toHaveBeenCalledWith(dto.userId, dto.roleId);
      expect(historyRepo.create).toHaveBeenCalledWith({ user, role, from_date: dto.from_date });
      expect(historyRepo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(saved);
    });
  });

  describe('getUserRoleHistory', () => {
    it('loads user via UsersService and returns history entries', async () => {
      const user = { id: 5 } as UserEntity;
      const records = [{ id: 1, user, role: {} as any, from_date: new Date() }] as UserRoleHistoryEntity[];

      usersService.getUserById.mockResolvedValue(user);
      historyRepo.find.mockResolvedValue(records);

      const result = await service.getUserRoleHistory(user.id);
      expect(usersService.getUserById).toHaveBeenCalledWith(user.id);
      expect(historyRepo.find).toHaveBeenCalledWith({ where: { user } });
      expect(result).toEqual(records);
    });
  });

  describe('getAllUserRoleHistory', () => {
    it('returns all history records', async () => {
      const all = [{ id: 2 }] as UserRoleHistoryEntity[];
      historyRepo.find.mockResolvedValue(all);

      const result = await service.getAllUserRoleHistory();
      expect(historyRepo.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(all);
    });
  });
});
