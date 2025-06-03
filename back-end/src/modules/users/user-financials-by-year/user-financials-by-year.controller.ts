import { Controller, Get, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { UserFinancialByYearService } from './user-financial-by-year.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';

@Controller('user-financial-by-year')
export class UserFinancialByYearController {
    constructor(
        private readonly userFinancialsByYearService: UserFinancialByYearService
    ) {}

    @Get()
    async getUserFinancialsByYear() {
        return this.userFinancialsByYearService.getUserFinancialsByYear();
    }
  @UseGuards(JwtAuthGuard)
  @Get('by-user-gard')
  async getUserFinancialsByUser(@Req() req) {
    const userId = req.user.sub;
    return this.userFinancialsByYearService.getUserFinancialsByUser(userId);
  }
  @Get('by-user')
  async getUserFinancialsByUserId(@Query('id', ParseIntPipe) queryId?: number) {
    return this.userFinancialsByYearService.getUserFinancialsByUser(queryId!);
  }

}
