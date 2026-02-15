import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from './users.service';
import { LoanActionsService } from '../loans/loan-actions/loan_actions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { PaymentDetailsEntity } from "../users/payment-details/payment_details.entity";
import { LoanActionBalanceService } from '../loans/loan-actions/loan_action_balance.service';
import { LoanEntity } from '../loans/Entity/loans.entity';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MembershipType } from './userTypes';
import { MailService } from '../mail/mail.service';
import { RoleMonthlyRateEntity } from '../role_monthly_rates/Entity/role_monthly_rates.entity';

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
    @InjectRepository(RoleMonthlyRateEntity)
    private readonly roleMonthlyRatesRepo: Repository<RoleMonthlyRateEntity>,
    private readonly whatsappService: WhatsappService,
    private readonly mailService: MailService,
  ) {}

  @Cron('00 00 * * *', { timeZone: 'Asia/Jerusalem' })
  async updateAllUsersBalances() {
    this.logger.log('🔄 Updating all users balances...');
    const users = await this.usersService.getAllUsers();
    const activeUsers = users.filter(user => user.membership_type == MembershipType.MEMBER);
    for (const user of activeUsers) {
      const net = await this.usersService.updateUserMonthlyBalance(user);
      this.logger.debug(`user ${user.id}: payment balance updated to ${net}`);
    }
    this.logger.log('✅ All user balances updated successfully.');
  }

  // עדכון יתרות הלוואות
  @Cron('0 0 * * *', { timeZone: 'Asia/Jerusalem' })

  async updateDailyLoanBalances() {
    const today = new Date().getDate(); // 1–31
    this.logger.log(`🔄 Checking loans with payment_date = ${today}`);

    const loans = await this.loansRepo.find({
      where: { isActive: true },
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

  @Cron('00 06 * * *', { timeZone: 'Asia/Jerusalem' })
  async sendNextDayChargeReminders() {
    const tomorrowDate = this.getTomorrowDateInIsrael();
    const tomorrowDay = tomorrowDate.getUTCDate();

    await this.sendLoanChargeReminders(tomorrowDay, tomorrowDate);
    await this.sendMembershipFeeReminders(tomorrowDay, tomorrowDate);
  }

  private async sendLoanChargeReminders(
    tomorrowDay: number,
    tomorrowDate: Date,
  ) {
    const loans = await this.loansRepo.find({
      where: { payment_date: tomorrowDay, isActive: true },
      relations: ['user', 'user.payment_details'],
      order: { id: 'ASC' },
    });

    for (const loan of loans) {
      const user = loan.user;
      if (!this.canSendReminderToUser(user)) continue;

      const dateText = this.formatDate(tomorrowDate);
      const lines = [
        `מחר ב${dateText} יתבצע חיוב בסך ${this.mailService.formatCurrency(
          loan.monthly_payment,
        )} עבור הלוואה מספר ${loan.id}.`,
        'אם ברצונך לשנות את יום החיוב הבא אנא פנה מיידית למזכירות הגמ"ח.',
      ];

      const debtLines = this.buildLoanDebtLines(user);
      if (debtLines.length) lines.push(...debtLines);

      await this.mailService.sendReceiptNotificationNow({
        to: user.email_address,
        fullName: `${user.first_name} ${user.last_name}`.trim() || 'לקוח יקר',
        idNumber: user.id_number ?? '',
        title: 'תזכורת חיוב הלוואה',
        lines,
      });
    }
  }

  private async sendMembershipFeeReminders(
    tomorrowDay: number,
    tomorrowDate: Date,
  ) {
    const users = await this.usersService.getAllUsers();

    for (const user of users) {
      if (user.membership_type !== MembershipType.MEMBER) continue;
      if (!user.payment_details?.charge_date) continue;
      if (user.payment_details.charge_date !== tomorrowDay) continue;
      if (!this.canSendReminderToUser(user)) continue;

      const amount = await this.getMonthlyFeeAmount(user, tomorrowDate);
      const dateText = this.formatDate(tomorrowDate);
      const lines = [
        amount != null
          ? `מחר ב${dateText} יתבצע חיוב בסך ${this.mailService.formatCurrency(
              amount,
            )}.`
          : `מחר ב${dateText} יתבצע חיוב דמי חבר.`,
        'אם ברצונך לשנות את יום החיוב הבא אנא פנה מיידית למזכירות הגמ"ח.',
      ];

      const debtLines = this.buildMemberFeeDebtLines(user);
      if (debtLines.length) lines.push(...debtLines);

      await this.mailService.sendReceiptNotificationNow({
        to: user.email_address,
        fullName: `${user.first_name} ${user.last_name}`.trim() || 'לקוח יקר',
        idNumber: user.id_number ?? '',
        title: 'תזכורת חיוב דמי חבר',
        lines,
      });
    }
  }

  private canSendReminderToUser(user: any): boolean {
    if (!user) return false;
    if (user.notify_account === false) return false;
    if (!user.email_address) return false;
    return true;
  }

  private buildLoanDebtLines(user: any): string[] {
    const lines: string[] = [];
    const loanBalances = user?.payment_details?.loan_balances ?? [];
    const loanDebt = loanBalances
      .filter((loan: any) => loan.balance < 0)
      .reduce((sum: number, loan: any) => sum + Math.abs(loan.balance), 0);
    if (loanDebt > 0) {
      lines.push(
        `[red]נ.ב יש לך חוב עבור ההלוואה בסך ${this.mailService.formatCurrency(
          loanDebt,
        )}.`,
        'יש להסדיר את החוב בהקדם.',
      );
    }
    return lines;
  }

  private buildMemberFeeDebtLines(user: any): string[] {
    const lines: string[] = [];
    const monthlyBalance = user?.payment_details?.monthly_balance;
    if (typeof monthlyBalance === 'number' && monthlyBalance < 0) {
      lines.push(
        `[red]נ.ב יש לך חוב בדמי חבר על סך ${this.mailService.formatCurrency(
          Math.abs(monthlyBalance),
        )}.`,
        'יש להסדיר את החוב בהקדם.',
      );
    }
    return lines;
  }

  private getTomorrowDateInIsrael(): Date {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jerusalem',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);
    return new Date(Date.UTC(year, month - 1, day + 1));
  }

  private async getMonthlyFeeAmount(
    user: any,
    asOf: Date,
  ): Promise<number | null> {
    const roleId = user?.current_role?.id;
    if (!roleId) return null;
    const rate = await this.roleMonthlyRatesRepo.findOne({
      where: {
        role: { id: roleId },
        effective_from: LessThanOrEqual(asOf),
      },
      order: { effective_from: 'DESC' },
    });
    return rate?.amount ?? null;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('he-IL');
  }

//   @Cron('36 22 * * *', { timeZone: 'Asia/Jerusalem' })
//   async sendDailyLoanReminders() {
//     const today = new Date().getDate();

//     this.logger.log(`📢 Sending WhatsApp reminders for loans due today (${today})...`);

//     const loans = await this.loansRepo.find({
//       where: { payment_date: today, isActive: true },
//       relations: ['user'],
//     });

//     if (!loans.length) {
//       this.logger.log('ℹ️ No loans due today.');
//       return;
//     }

//     for (const loan of loans) {
//       try {
//         const user = loan.user;
//         if (!user?.phone_number) continue;

//         const message = 
// `תזכורת תשלום הלוואה:
// היום יש חיוב על הלוואה שלך.
// סכום תשלום: ${loan.monthly_payment} ₪
// מספר הלוואה: ${loan.id}

// אם יש שאלה או בעיה — תמיד כאן לעזרה. 🙏`;

//         await this.whatsappService.sendText("972533161790", message);

//         this.logger.log(`📨 Reminder sent to ${user.phone_number} for loan ${loan.id}`);
//       } catch (err) {
//         this.logger.error(`❌ Failed sending reminder for loan ${loan.id}: ${err.message}`);
//       }
//     }
//   }
}
