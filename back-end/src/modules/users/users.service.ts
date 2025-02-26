import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';
import { payment_method } from "../../types/userTypes"; 
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(PaymentDetailsEntity)
    private paymentDetailsRepository: Repository<PaymentDetailsEntity>,
  ) {}

  async createUserWithPayment(userData: Partial<UserEntity>, paymentData: Partial<PaymentDetailsEntity>): Promise<UserEntity> {
    if (paymentData.payment_method === undefined || !Object.values(paymentData).includes(paymentData.payment_method)) {
      throw new Error('Invalid payment method');
    }
  
    const salt = await bcrypt.genSalt(10);
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, salt);
    } else {
      throw new Error('Password is required');
    }
  
    const newUser = this.usersRepository.create(userData);
  
    const paymentDetails = this.paymentDetailsRepository.create(paymentData);
    newUser.payment_details = paymentDetails;
  
    return this.usersRepository.save(newUser);
  
  }
  async getUserById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async getUserByIdNumber(id_number: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id: Number(id_number) } });
  }
}
