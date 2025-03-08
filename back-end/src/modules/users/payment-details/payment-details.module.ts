import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentDetailsEntity } from './payment_details.entity';
import { PaymentDetailsService } from './payment-details.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentDetailsEntity])],
  exports: [PaymentDetailsService],
  providers: [PaymentDetailsService]
})
export class PaymentDetailsModule {}
