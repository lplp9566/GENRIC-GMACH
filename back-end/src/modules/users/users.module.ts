import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { PaymentDetailsModule } from './payment-details/payment-details.module'; // ✅ נייבא את מודול התשלומים
import { UserBalanceCronService } from './user-balance-cron.service';
import { MonthlyDepositsModule } from '../monthly_deposits/monthly_deposits.module';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { MonthlyRatesModule } from '../monthly_rates/monthly_rates.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity,PaymentDetailsEntity]),
    forwardRef(() => MonthlyDepositsModule),
    forwardRef(()=> MonthlyRatesModule),
    PaymentDetailsModule,
   
  ],
  controllers: [UsersController],
  providers: [UsersService, UserBalanceCronService],
  exports: [UsersService , UserBalanceCronService ,TypeOrmModule],
})
export class UsersModule {}
