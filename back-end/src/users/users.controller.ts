import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async createUserWithPayment(@Body() body: { userData: Partial<UserEntity>, paymentData: Partial<PaymentDetailsEntity> }) {
       const { userData, paymentData } = body;
       return this.usersService.createUserWithPayment(userData, paymentData); 
    }
}
