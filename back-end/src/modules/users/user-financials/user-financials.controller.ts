import { Controller, Get, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserFinancialService } from './user-financials.service';

@Controller('user-financial')
export class UserFinancialController {
  constructor(private readonly userFinancialService: UserFinancialService) {}

  @Get()
  async getUserFinancials() {
    return this.userFinancialService.getAllUserFinancials();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-user-guard')
  async getUserFinancialsByUser(@Req() req) {
    const userId = req.user.sub;
    return this.userFinancialService.getUserFinancialsByUserId(userId);
  }

  @Get('by-user')
  async getUserFinancialsByUserId(@Query('id', ParseIntPipe) queryId?: number) {
    return this.userFinancialService.getUserFinancialsByUserId(queryId!);
  }
}
