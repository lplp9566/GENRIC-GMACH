import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RequestEntity } from './entities/request.entity';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { RequestStatus } from './dto/request.dto';
jest.spyOn(console, 'error').mockImplementation(() => {});

const mockRequestRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

const mockUsersService = () => ({
  getUserById: jest.fn(),
});

describe('RequestsService', () => {
  let service: RequestsService;
  let requestRepo: jest.Mocked<Repository<RequestEntity>>;
  let usersService: ReturnType<typeof mockUsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        { provide: getRepositoryToken(RequestEntity), useFactory: mockRequestRepo },
        { provide: UsersService, useFactory: mockUsersService },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
    requestRepo = module.get(getRepositoryToken(RequestEntity));
    usersService = module.get(UsersService);
  });

  describe('createRequest', () => {
    it('should create and save a request', async () => {
      const mockUser = { id: 1 } as any;
      const requestData = { userId: 1, type: 'typeA', description: 'test' } as any;
      const createdRequest = { ...requestData, user: mockUser } as any;

      usersService.getUserById.mockResolvedValue(mockUser);
      requestRepo.create.mockReturnValue(createdRequest);
      requestRepo.save.mockResolvedValue({ ...createdRequest, id: 1 });

      const result = await service.createRequest(requestData);

      expect(usersService.getUserById).toHaveBeenCalledWith(1);
      expect(requestRepo.create).toHaveBeenCalledWith(requestData);
      expect(result).toHaveProperty('id');
    });

    it('should throw BadRequestException if user not found', async () => {
      usersService.getUserById.mockResolvedValue(null);

      await expect(service.createRequest({ userId: 99 } as any)).rejects.toThrow('User not found');
    });
  });

  describe('editStatus', () => {
    it('should update status of a request', async () => {
      const existingRequest = { id: 1, status: RequestStatus.PENDING } as any;

      requestRepo.findOne.mockResolvedValue(existingRequest);
      requestRepo.save.mockResolvedValue({ ...existingRequest, status: RequestStatus.APPROVED });

      const result = await service.editStatus(1, RequestStatus.APPROVED);
      expect(result.status).toBe(RequestStatus.APPROVED);
    });

    it('should throw BadRequestException if request not found', async () => {
      requestRepo.findOne.mockResolvedValue(null);
      await expect(service.editStatus(99, RequestStatus.APPROVED)).rejects.toThrow('Request not found');
    });
  });
});
