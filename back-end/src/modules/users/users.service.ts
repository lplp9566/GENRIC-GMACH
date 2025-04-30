import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';
import { payment_method } from '../../types/userTypes';
import { PaymentDetailsEntity } from './payment-details/payment_details.entity';
import { MonthlyDepositsService } from '../monthly_deposits/monthly_deposits.service';
import { MonthlyRatesService } from '../monthly_rates/monthly_rates.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,

    @InjectRepository(PaymentDetailsEntity)
    private paymentDetailsRepository: Repository<PaymentDetailsEntity>,

    @Inject(forwardRef(() => MonthlyDepositsService))
    private readonly monthlyDepositsService: MonthlyDepositsService,

    @Inject(forwardRef(() => MonthlyRatesService))
    private readonly monthlyRatesService: MonthlyRatesService,
  ) {}
  
  async getUserPaymentDetails(userId: number): Promise<PaymentDetailsEntity | null> {
    return this.paymentDetailsRepository.findOne({ where: { user: { id: userId } } });
}


  async createUserWithPayment(
    userData: Partial<UserEntity>,
    paymentData: Partial<PaymentDetailsEntity>,
  ): Promise<UserEntity> {
    try {
      if (
        paymentData.payment_method === undefined ||
        !Object.values(paymentData).includes(paymentData.payment_method)
      ) {
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
    } catch (error) {
  throw new BadRequestException(error.message);
    }
    
  }
  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { email_address: email }, relations: ['payment_details'], });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async getUserById(id: number): Promise<UserEntity | null> {
    const user = await  this.usersRepository.findOne({
      where: { id },
      relations: ['payment_details'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserByIdNumber(id_number: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id: Number(id_number) } });
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return this.usersRepository.find({
      relations: ['payment_details'], 
    });
  }


 
  async calculateTotalDue(user: UserEntity): Promise<number> {
    const currentDate = new Date();
    let totalDue = 0;

    if (!user.payment_details || !user.payment_details.charge_date) {
      throw new Error(`Missing payment details for user ${user.id}`);
    }

    const rates = await this.monthlyRatesService.getRatesForRole(user.role);

    if (rates.length === 0) {
      throw new Error(`No monthly rates found for role ${user.role}`);
    }

    let lastRate = rates[0];
    const userJoinYear = user.join_date.getFullYear();
    const userJoinMonth = user.join_date.getMonth() + 1;

    const chargeDay = Number(user.payment_details.charge_date);

    for (let year = userJoinYear; year <= currentDate.getFullYear(); year++) {
      for (let month = year === userJoinYear ? userJoinMonth : 1; month <= 12; month++) {
        if (year === currentDate.getFullYear() && month > currentDate.getMonth() + 1) {
          break;
        }

        if (year === currentDate.getFullYear() && month === currentDate.getMonth() + 1) {
          if (currentDate.getDate() < chargeDay) {
            break;
          }
        }

        const newRate = rates.find((r) => r.year === year && r.month === month);
        if (newRate) {
          lastRate = newRate;
        }

        totalDue += lastRate.amount;
      }
    }

    return totalDue;
  }
  async getUserTotalDeposits(userId: number): Promise<number> {
    const UserTotalDeposits = await this.monthlyDepositsService.getUserTotalDeposits(userId);
    return UserTotalDeposits;
  }


  async calculateUserMonthlyBalance(
    user: UserEntity,
  ): Promise<{ total_due: number; total_paid: number; balance: number }> {
    const totalDue = await this.calculateTotalDue(user);
    const totalPaid = await this.getUserTotalDeposits(user.id);
    const balance = totalPaid - totalDue;

    return { total_due: totalDue, total_paid: totalPaid, balance };
  }

  async updateUserMonthlyBalance(user: UserEntity) {
    const paymentDetails = await this.paymentDetailsRepository.findOne({
      where: { user: { id: user.id } },
      relations: ["user"],
    });
    if (!paymentDetails) {
      throw new Error("Payment details not found for user");
    }

    const balanceData = await this.calculateUserMonthlyBalance(user)
    paymentDetails.monthly_balance = balanceData.balance;
    await this.paymentDetailsRepository.save(paymentDetails);
    return paymentDetails.monthly_balance;
  }
  async getAllUsersBalances(): Promise<
    { user: string; total_due: number; total_paid: number; balance: number }[]
  > {
    const users = await this.usersRepository.find();
    const balances = await Promise.all(
      users.map(async (user) => {
        const balanceData = await this.calculateUserMonthlyBalance(user);
        return {
          user: `${user.first_name} ${user.last_name}`,
          role: user.role,
          ...balanceData,
        };
      }),
    );

    return balances;
  }
}
