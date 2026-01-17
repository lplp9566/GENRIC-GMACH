import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { Repository, IsNull, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { PasswordResetEntity } from './password-reset.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(PasswordResetEntity)
    private resetRepo: Repository<PasswordResetEntity>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepo.findOne({
      where: { email_address: email },
      relations: ['payment_details'],
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      sub: user.id,
      email: user.email_address,
      is_admin: user.is_admin,
      user: user,
    };
    return this.jwtService.sign(payload);
  }

  async requestPasswordReset(email: string) {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) throw new BadRequestException('Email is required');

    const user = await this.userRepo.findOne({
      where: { email_address: normalized },
    });

    // Always return ok to avoid user enumeration
    if (!user) return { ok: true };

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const record = this.resetRepo.create({
      email: normalized,
      code,
      expires_at: expiresAt,
      used_at: null,
    });

    await this.resetRepo.save(record);

    const html = `
      <div style="direction:rtl; font-family:Arial, sans-serif;">
        <h2>קוד אימות לאיפוס סיסמה</h2>
        <p>הקוד שלך הוא:</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:3px;">${code}</div>
        <p>תוקף הקוד: 5 דקות.</p>
      </div>
    `;

    await this.mailService.sendMail(
      normalized,
      'קוד אימות לאיפוס סיסמה',
      html,
      `קוד האימות שלך: ${code}`
    );

    return { ok: true };
  }

  async verifyResetCode(email: string, code: string) {
    const normalized = String(email || '').trim().toLowerCase();
    const rawCode = String(code || '').trim();
    if (!normalized || !rawCode) throw new BadRequestException('Invalid request');

    const record = await this.resetRepo.findOne({
      where: {
        email: normalized,
        code: rawCode,
        used_at: IsNull(),
        expires_at: MoreThan(new Date()),
      },
      order: { id: 'DESC' },
    });

    if (!record) throw new BadRequestException('Invalid or expired code');

    return { valid: true };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const normalized = String(email || '').trim().toLowerCase();
    const rawCode = String(code || '').trim();
    if (!normalized || !rawCode || !newPassword) {
      throw new BadRequestException('Invalid request');
    }

    const record = await this.resetRepo.findOne({
      where: {
        email: normalized,
        code: rawCode,
        used_at: IsNull(),
        expires_at: MoreThan(new Date()),
      },
      order: { id: 'DESC' },
    });

    if (!record) throw new BadRequestException('Invalid or expired code');

    const user = await this.userRepo.findOne({
      where: { email_address: normalized },
    });
    if (!user) throw new BadRequestException('User not found');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await this.userRepo.save(user);

    record.used_at = new Date();
    await this.resetRepo.save(record);

    return { ok: true };
  }
}
