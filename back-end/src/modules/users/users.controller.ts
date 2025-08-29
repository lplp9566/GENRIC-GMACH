import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // @UseGuards(AdminGuard)
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
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
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
  @Get('balance')
  async getUserBalance(@Body() body: { userId: number }) {
    const paymentDetails = await this.usersService.getUserPaymentDetails(
      body.userId,
    );
    return {
      monthly_balance: paymentDetails?.monthly_balance || 0,
    };
  }
}
