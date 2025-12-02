import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from './users.service';
import { LoanActionsService } from '../loans/loan-actions/loan_actions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentDetailsEntity } from "../users/payment-details/payment_details.entity";
import { LoanActionBalanceService } from '../loans/loan-actions/loan_action_balance.service';
import { LoanEntity } from '../loans/Entity/loans.entity';

// ⭐ נוסיף שירות שליחת הודעות
import { WhatsappService } from '../whatsapp/whatsapp.service';

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

    // ⭐ מוסיפים ל־constructor
    private readonly whatsappService: WhatsappService,
  ) {}

  // עדכון יתרות חודשיות
  @Cron('21 25 * * *', { timeZone: 'Asia/Jerusalem' })
  async updateAllUsersBalances() {
    this.logger.log('🔄 Updating all users balances...');
    const users = await this.usersService.getAllUsers();
    for (const user of users!) {
      const net = await this.usersService.updateUserMonthlyBalance(user);
      this.logger.debug(`user ${user.id}: payment balance updated to ${net}`);
    }
    this.logger.log('✅ All user balances updated successfully.');
  }

  // עדכון יתרות הלוואות
  @Cron('00 00 * * *', { timeZone: 'Asia/Jerusalem' })
  async updateDailyLoanBalances() {
    const today = new Date().getDate(); // 1–31
    this.logger.log(`🔄 Checking loans with payment_date = ${today}`);

    const loans = await this.loansRepo.find({
      where: { payment_date: today, isActive: true },
      relations: ['user'], // ⭐ כדי שנדע למי לשלוח הודעה
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

  // ⭐⭐ --- שליחת תזכורת אוטומטית על הלוואות --- ⭐⭐
  @Cron('00 09 * * *', { timeZone: 'Asia/Jerusalem' })
  async sendDailyLoanReminders() {
    const today = new Date().getDate();

    this.logger.log(`📢 Sending WhatsApp reminders for loans due today (${today})...`);

    const loans = await this.loansRepo.find({
      where: { payment_date: today, isActive: true },
      relations: ['user'],
    });

    if (!loans.length) {
      this.logger.log('ℹ️ No loans due today.');
      return;
    }

    for (const loan of loans) {
      try {
        const user = loan.user;
        if (!user?.phone_number) continue;

        const message = 
`תזכורת תשלום הלוואה:
היום יש חיוב על הלוואה שלך.
סכום תשלום: ${loan.monthly_payment} ₪
מספר הלוואה: ${loan.id}

אם יש שאלה או בעיה — תמיד כאן לעזרה. 🙏`;

        await this.whatsappService.sendText("972533161790", message);

        this.logger.log(`📨 Reminder sent to ${user.phone_number} for loan ${loan.id}`);
      } catch (err) {
        this.logger.error(`❌ Failed sending reminder for loan ${loan.id}: ${err.message}`);
      }
    }
  }
}
