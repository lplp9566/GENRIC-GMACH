import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyDepositsEntity } from "./monthly_deposits.entity";
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { getYearFromDate } from 'src/services/services';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';

@Injectable()
export class MonthlyDepositsService {
  constructor(
    @InjectRepository(MonthlyDepositsEntity)
    private readonly monthlyDepositsRepository: Repository<MonthlyDepositsEntity>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly userFinashialService: UserFinancialsService,
    private readonly fundsOverviewService: FundsOverviewService
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
        if(!payment_details.amount || !payment_details.deposit_date || !payment_details.user){
                throw new Error('Missing required fields');
        }
      const year = await getYearFromDate(payment_details.deposit_date);
      const user = await this.usersService.getUserById(
        Number(payment_details.user),
      );

      if (!user) {
        throw new Error('User not found');
      }
      const newDeposit = this.monthlyDepositsRepository.create({
        user: user,
        amount: payment_details.amount,
        deposit_date: payment_details.deposit_date,
      });

      await this.monthlyDepositsRepository.save(newDeposit);
      await this.userFinashialService.recordMonthlyDeposit(
        user,
        year,
        payment_details.amount,
      );
      await this.fundsOverviewService.addMonthlyDeposit(payment_details.amount);
      // ✅ עדכון `balance` אחרי כל תשלום חודשי
      await this.usersService.updateUserMonthlyBalance(user);

      return { message: `Deposit recorded successfully.` };
    } catch (error) {
      return error.message;
    }
  }
}
