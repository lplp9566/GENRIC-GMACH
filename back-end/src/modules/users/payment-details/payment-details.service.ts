import { Injectable } from '@nestjs/common';
import { PaymentDetailsEntity } from './payment_details.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentDetailsService {
  constructor(
    @InjectRepository(PaymentDetailsEntity)
    private readonly paymentDetailsRepository: Repository<PaymentDetailsEntity>,
  ) {}
}
