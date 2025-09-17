import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.login(email, password);
    res.cookie('Authentication', token, {
      httpOnly: true,
      secure: true,          // חובה כי Netlify הוא HTTPS
  sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24,
    });
    return { message: 'Token issued successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  async validate(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin-only')
  adminRoute(@Req() req: Request) {
    return { message: 'You are admin', user: req.user };
  }
  @Post('logout')
logout(@Res({ passthrough: true }) res: Response) {
  res.clearCookie('Authentication', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return { message: 'Logged out' };
}

}
