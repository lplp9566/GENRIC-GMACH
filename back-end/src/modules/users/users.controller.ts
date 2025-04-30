import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { AdminGuard } from '../auth/admin.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    // @UseGuards(AdminGuard)
    @Post()
    async createUserWithPayment(@Body() body: { userData: Partial<UserEntity>, paymentData: Partial<PaymentDetailsEntity> }) {
       const { userData, paymentData } = body;
       return this.usersService.createUserWithPayment(userData, paymentData); 
    }
    @Get()
    async getAllUsers(){
        return this.usersService.getAllUsers()
    }
    @Get("UsersData")
    async getUsersData(@Body()body:{userId:number}){
        
    }
    @Get('balance')
    async getUserBalance(@Body() body: { userId: number }) {
      const paymentDetails = await this.usersService.getUserPaymentDetails(body.userId);
      return {
        monthly_balance: paymentDetails?.monthly_balance || 0
      };
    }

}
