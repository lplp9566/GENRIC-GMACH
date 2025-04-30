import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Module({
    imports: [
        UsersModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'secretKey',
          signOptions: { expiresIn: '2h' },
        }),
      ],
      providers: [AuthService, JwtStrategy, JwtAuthGuard, AdminGuard],
      controllers: [AuthController],
      exports: [JwtAuthGuard, AdminGuard],
})
export class AuthModule {}
