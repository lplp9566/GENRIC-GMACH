import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/user.entity';
import { PasswordResetEntity } from './password-reset.entity';
import { MailService } from '../mail/mail.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<UserEntity>>;
  let resetRepo: jest.Mocked<Repository<PasswordResetEntity>>;
  let jwtService: { sign: jest.Mock };
  let mailService: { sendMail: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useFactory: mockRepo },
        { provide: getRepositoryToken(PasswordResetEntity), useFactory: mockRepo },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        { provide: MailService, useValue: { sendMail: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(UserEntity));
    resetRepo = module.get(getRepositoryToken(PasswordResetEntity));
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
  });

  describe('login', () => {
    it('returns JWT on valid credentials', async () => {
      const user = {
        id: 1,
        email_address: 'a@b.com',
        password: 'hashed',
        is_admin: false,
        permission: 'user',
      } as any;
      userRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token');

      const result = await service.login('a@b.com', 'pass');

      expect(result).toBe('token');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('throws Unauthorized on invalid credentials', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.login('a@b.com', 'pass')).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('throws on empty email', async () => {
      await expect(service.requestPasswordReset('')).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('returns ok when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.requestPasswordReset('missing@x.com');
      expect(result).toEqual({ ok: true });
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });

    it('creates reset record and sends mail', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 } as any);
      resetRepo.create.mockImplementation((v: any) => v);
      resetRepo.save.mockResolvedValue({ id: 1 } as any);

      const result = await service.requestPasswordReset('user@x.com');

      expect(result).toEqual({ ok: true });
      expect(mailService.sendMail).toHaveBeenCalled();
    });
  });

  describe('verifyResetCode', () => {
    it('throws on invalid code', async () => {
      resetRepo.findOne.mockResolvedValue(null);
      await expect(service.verifyResetCode('a@b.com', '000000')).rejects.toBeInstanceOf(
        BadRequestException
      );
    });
  });

  describe('resetPassword', () => {
    it('throws on invalid code', async () => {
      resetRepo.findOne.mockResolvedValue(null);
      await expect(
        service.resetPassword('a@b.com', '000000', 'newpass')
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('updates password and marks reset as used', async () => {
      const record = { id: 1, used_at: null } as any;
      resetRepo.findOne.mockResolvedValue(record);
      userRepo.findOne.mockResolvedValue({ id: 1, password: 'old' } as any);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      userRepo.save.mockResolvedValue({ id: 1 } as any);
      resetRepo.save.mockResolvedValue({ id: 1 } as any);

      const result = await service.resetPassword('a@b.com', '123456', 'newpass');

      expect(result).toEqual({ ok: true });
      expect(record.used_at).toBeInstanceOf(Date);
    });
  });
});
