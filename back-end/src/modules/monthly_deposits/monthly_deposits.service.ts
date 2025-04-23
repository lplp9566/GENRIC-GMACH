import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyDepositsEntity } from "./monthly_deposits.entity";
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { getYearFromDate } from 'src/services/services';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';

@Injectable()
export class MonthlyDepositsService {
  constructor(
    @InjectRepository(MonthlyDepositsEntity)
    private readonly monthlyDepositsRepository: Repository<MonthlyDepositsEntity>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly userFinashialByYearService: UserFinancialByYearService,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly userFinancialsService: UserFinancialsService
  ) {}

  async getAllDeposits(): Promise<MonthlyDepositsEntity[]> {
    try {
      const allDeposits = this.monthlyDepositsRepository.find();
      if (!allDeposits) {
        throw new Error('no dMonthlyDeposits fund');
      }
      return allDeposits;
    } catch (error) {
      return error.message;
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
      return error.message;
    }
  }
  async recordMonthlyDeposit(payment_details: Partial<MonthlyDepositsEntity>) {
    try {
      // ✅ בדיקת תקינות
      if (!payment_details.amount || !payment_details.deposit_date || !payment_details.user) {
        throw new Error('Missing required fields');
      }
  
      const year = await getYearFromDate(payment_details.deposit_date);
  
      // ✅ שליפת משתמש
      const user = await this.usersService.getUserById(Number(payment_details.user));
      if (!user) {
        throw new Error('User not found');
      }
  
      // ✅ יצירת ההפקדה ושמירה
      const newDeposit = this.monthlyDepositsRepository.create({
        user: user,
        amount: payment_details.amount,
        deposit_date: payment_details.deposit_date,
      });
      await this.monthlyDepositsRepository.save(newDeposit);
  
      // ✅ פעולות נוספות במקביל
      await Promise.all([
        this.userFinashialByYearService.recordMonthlyDeposit(user, year, payment_details.amount),
        this.userFinancialsService.recordMonthlyDeposit(user, payment_details.amount),
        this.fundsOverviewService.addMonthlyDeposit(payment_details.amount),
        this.usersService.updateUserMonthlyBalance(user),
      ]);
  
      return { message: `Deposit recorded successfully.` };
  
    } catch (error) {
      console.error('❌ Error recording deposit:', error.message);
      throw new Error(error.message);
    }
  }
}  