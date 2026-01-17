import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { UserEntity } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { PasswordResetEntity } from './password-reset.entity';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    MailModule,
    PassportModule,
    TypeOrmModule.forFeature([UserEntity, PasswordResetEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '5d' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, AdminGuard],
  controllers: [AuthController],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
