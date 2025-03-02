import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { PaymentDetailsModule } from './payment-details/payment-details.module'; // ✅ נייבא את מודול התשלומים
import { UserDebtsModule } from './user_debts/user_debts.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PaymentDetailsModule,
  //   UserDebtsModule,
  // ]
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService , TypeOrmModule],
})
export class UsersModule {}
