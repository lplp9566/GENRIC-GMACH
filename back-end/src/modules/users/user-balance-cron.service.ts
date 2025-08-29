import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from './users.service';
import { LoanActionsService } from '../loans/loan-actions/loan_actions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentDetailsEntity } from "../users/payment-details/payment_details.entity";
import { LoanActionBalanceService } from '../loans/loan-actions/loan_action_balance.service';
import { LoanEntity } from '../loans/Entity/loans.entity';

@Injectable()
export class UserBalanceCronService {
  private readonly logger = new Logger(UserBalanceCronService.name);

  constructor(
    private readonly usersService: UsersService,

    private readonly loanPaymentsService: LoanActionBalanceService,

    @InjectRepository(LoanEntity)
    private readonly loansRepo: Repository<LoanEntity>,

    @InjectRepository(PaymentDetailsEntity)
    private readonly paymentDetailsRepo: Repository<PaymentDetailsEntity>,
  ) {}

  @Cron('00 00 * * *', { timeZone: 'Asia/Jerusalem' })
  async updateAllUsersBalances() {
    this.logger.log('🔄 Updating all users balances...');
    const users = await this.usersService.getAllUsers();
    for (const user of users!) {

   const net =   await this.usersService.updateUserMonthlyBalance(user);
      this.logger.debug(`user ${user.id}: payment  balance updated to ${net}`);
    }
    this.logger.log('✅ All user balances updated successfully.');
  }
  @Cron('00 00 * * *', { timeZone: 'Asia/Jerusalem' })
  async updateDailyLoanBalances() {
    const today = new Date().getDate(); // 1–31
    this.logger.log(`🔄 Checking loans with payment_date = ${today}`);

    const loans = await this.loansRepo.find({
      where: { payment_date: today, isActive: true },
    });

    this.logger.log(`Found ${loans.length} active loans to update`);

    for (const loan of loans) {
      try {
        const net = await this.loanPaymentsService.computeLoanNetBalance(loan.id);
        this.logger.debug(`Loan ${loan.id}: net balance updated to ${net}`);
      } catch (err) {
        this.logger.error(`Error updating loan ${loan.id}: ${err.message}`);
      }
    }

    this.logger.log('✅ Daily loan balances update complete.');
  }
    // רץ כל 5 דקות
  @Cron(CronExpression.EVERY_5_MINUTES, { timeZone: 'Asia/Jerusalem' })
  async fiveMinuteJob() {
    this.logger.log('⏱️ fiveMinuteJob running (every 5 minutes)...');

    // דוגמה לפעולה — שנה למה שאתה צריך
    const users = await this.usersService.getAllUsers();
    this.logger.debug(`Checked ${users?.length ?? 0} users in 5-min job`);

    // TODO: הכנס כאן את הלוגיקה הרצויה
  }
}
