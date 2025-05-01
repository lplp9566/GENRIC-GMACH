import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

// ✅ נבצע mock למודול bcrypt בצורה ברורה
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockUserRepo = () => ({
  findOne: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<UserEntity>>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useFactory: mockUserRepo },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(UserEntity));
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const mockUser = {
        id: 1,
        email_address: 'test@example.com',
        password: 'hashedpassword',
        is_admin: true,
      } as UserEntity;

      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // ✅ תיקון בטיפוס

      const result = await service.login('test@example.com', 'password123');
      expect(result).toBe('mock-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@example.com',
        is_admin: true,
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.login('notfound@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockUser = {
        id: 1,
        email_address: 'test@example.com',
        password: 'hashedpassword',
        is_admin: false,
      } as UserEntity;

      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // ❌ סיסמה שגויה

      await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
