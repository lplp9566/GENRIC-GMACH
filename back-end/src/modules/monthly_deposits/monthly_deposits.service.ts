import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyDepositsEntity } from "./monthly_deposits.entity";
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { getMonthFromDate, getYearFromDate } from '../../services/services';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UserFinancialService } from '../users/user-financials/user-financials.service';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';

@Injectable()
export class MonthlyDepositsService {
  constructor(
    @InjectRepository(MonthlyDepositsEntity)
    private readonly monthlyDepositsRepository: Repository<MonthlyDepositsEntity>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly userFinancialByYearService: UserFinancialByYearService,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly userFinancialsService: UserFinancialService,
    private readonly fundsOverviewByYearService: FundsOverviewByYearService,
  ) {}

  async getAllDeposits(): Promise<MonthlyDepositsEntity[]> {
    try {
      const allDeposits = this.monthlyDepositsRepository.find({order: {deposit_date: 'ASC'},relations:["user"]});
      if (!allDeposits) {
        throw new Error('no dMonthlyDeposits fund');
      }
      return allDeposits;
    } catch (error) {
    throw new BadRequestException(error.message);
    }
  }
  async getUserTotalDeposits(userId: number): Promise<number> {
    try {
      const result = await this.monthlyDepositsRepository
        .createQueryBuilder('deposit')
        .where('deposit.userId = :userId', { userId })
        .select('SUM(deposit.amount)', 'totalPaid')
        .getRawOne();

      return result?.totalPaid || 0;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async getUserDeposits(userId: number): Promise<MonthlyDepositsEntity[]> {
    try {
      const result = await this.monthlyDepositsRepository.find({
        where: {
          user: { id: userId },
        },
        order: { year: 'ASC', month: 'ASC' },
        relations: ['user']
      });
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async recordMonthlyDeposit(payment_details: Partial<MonthlyDepositsEntity>) {
    try {
      // ✅ בדיקת תקינות
      if (!payment_details.amount || !payment_details.deposit_date || !payment_details.user) {
        throw new Error('Missing required fields');
      }
  
      const year =  getYearFromDate(payment_details.deposit_date);
      const month =  getMonthFromDate(payment_details.deposit_date);

      const user = await this.usersService.getUserById(Number(payment_details.user));
      if (!user) {
        throw new Error('User not found');
      }
  
      const newDeposit = this.monthlyDepositsRepository.create({
        user: user,
        description: payment_details.description,
        payment_method: payment_details.payment_method,
        amount: payment_details.amount,
        deposit_date: payment_details.deposit_date,
        year: year,
        month: month
      });
      await this.monthlyDepositsRepository.save(newDeposit);
      await Promise.all([
        this.userFinancialByYearService.recordMonthlyDeposit(user, year, payment_details.amount),
        this.userFinancialsService.recordMonthlyDeposit(user, payment_details.amount),
        this.fundsOverviewService.addMonthlyDeposit(payment_details.amount),

        this.fundsOverviewByYearService.recordMonthlyDeposit(year, payment_details.amount),
      ]);
      await this.usersService.updateUserMonthlyBalance(user);

      return { message: `Deposit recorded successfully.` };
  
    } catch (error) {
      console.error('❌ Error recording deposit:', error.message);
      throw new BadRequestException(error.message);
    }
  }
  // async editMonthlyDeposit(depositId: number, updatedDetails: Partial<MonthlyDepositsEntity>) {
  //   try {
  //     const existingDeposit = await this.monthlyDepositsRepository.findOne({
  //       where: { id: depositId },
  //       relations: ['user'],
  //     });
  //     if (!existingDeposit) {
  //       throw new Error('Deposit not found');
  //     }   
  //     const oldAmount = existingDeposit.amount;
  //     const oldYear = existingDeposit.year;
  //     const newAmount = updatedDetails.amount ?? existingDeposit.amount;
  //     const newDepositDate = updatedDetails.deposit_date ?? existingDeposit.deposit_date;
  //     const newYear = getYearFromDate(newDepositDate);
  //     Object.assign(existingDeposit, updatedDetails, {
  //       year: newYear,
  //       month: getMonthFromDate(newDepositDate),
  //     }); 
  //     await this.monthlyDepositsRepository.save(existingDeposit);

  //     const amountDifference = newAmount - oldAmount;

  //     if (amountDifference !== 0 || oldYear !== newYear) {
  //       await Promise.all([
  //         this.userFinancialByYearService.updateMonthlyDeposit(
  //           existingDeposit.user,
  //           oldYear,
  //           newYear,
  //           amountDifference,

  //         ),
  //         this.userFinancialsService.updateMonthlyDeposit(
  //           existingDeposit.user,
  //           amountDifference,
  //         ),
  //         this.fundsOverviewService.updateMonthlyDeposit(
  //           amountDifference, 
  //         ),
  //         this.fundsOverviewByYearService.updateMonthlyDeposit(
  //           oldYear,  
  //           newYear,
  //           amountDifference,
  //         ),
  //       ]);
  //     }
  //     await this.usersService.updateUserMonthlyBalance(existingDeposit.user);
  //     return { message: `Deposit updated successfully.` };
  //   } catch (error) {
  //     console.error('❌ Error updating deposit:', error.message);
  //     throw new BadRequestException(error.message);
  //   }
  // }
}  