// src/auth/auth.controller.ts
import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 1. Login – מקבל email+password, שומר JWT ב-cookie
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user, res);
  }

  // 2. Validate – רק מי שמחובר יכול לקרוא, מחזיר req.user
  @UseGuards(JwtAuthGuard)
  @Post('validate')
  validate(@Req() req: Request) {
    return req.user;
  }
}
