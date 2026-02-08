import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MembershipType, UpdateUserWithPaymentDto } from './userTypes';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async createUserWithPayment(
    @Body()
    body: {
      userData: Partial<UserEntity>;
      paymentData: Partial<PaymentDetailsEntity>;
    },

  ) {
    const { userData, paymentData } = body;
    return this.usersService.createUserAndPaymentInfo(userData, paymentData);
  }
  
@Get()
@UseGuards(JwtAuthGuard,
  //  AdminGuard
  )
async getAllUsers(
  @Query('membershipType') membershipType?: MembershipType,
  @Query('isAdmin') isAdmin?: string,
) {
  
  return this.usersService.findUsers({
    membershipType,
    isAdmin: isAdmin === undefined ? undefined : isAdmin === 'true',
  });
}
  @UseGuards(JwtAuthGuard)
  @Get('UsersData')
  async getUsersData(@Body() body: { userId: number }) {
    return this.usersService.getUserById(body.userId);
  }

  @Get('keep-alive')
  async keepAlive() {
    return this.usersService.keepAlive();
  }
  // @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('balance')
  async getUserBalance(@Body() body: { userId: number }) {
    const paymentDetails = await this.usersService.getAllMemberUserPaymentDetails(
      body.userId,
    );
    return {
      monthly_balance: paymentDetails?.monthly_balance || 0,
    };
  }
   @Post("create_Year_Summary")
  async createYearSummary(
  ){
    return this.usersService.createYearSummary(2025)
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUserAndPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserWithPaymentDto,
  ) {
    const { userData, paymentData } = dto ?? {};
    return this.usersService.updateUserAndPaymentInfo(id, userData, paymentData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('year-summary')
  async sendYearSummaryToUser(@Req() req: any) {
    const userId = req.user.sub;
    const year = new Date().getFullYear() - 1;
    return this.usersService.createYearSummaryForUser(userId, year);
  }
 
}
