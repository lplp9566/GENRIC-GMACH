import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentDetailsEntity } from './payment_details.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentDetailsEntity])],
  exports: [TypeOrmModule]
})
export class PaymentDetailsModule {}
