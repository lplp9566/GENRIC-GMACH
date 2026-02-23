import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';
import { LoanActionEntity } from '../loans/loan-actions/Entity/loan_actions.entity';
import { LoanPaymentActionType } from '../loans/loan-dto/loanTypes';
import { DepositsActionsEntity } from '../deposits/deposits-actions/Entity/deposits-actions.entity';
import { DepositActionsType } from '../deposits/deposits-actions/depostits-actions-dto';
import { MonthlyDepositsEntity } from '../monthly_deposits/monthly_deposits.entity';
import { OrderReturnEntity } from '../order-return/Entity/order-return.entity';
import { DonationsEntity } from '../donations/Entity/donations.entity';
import { DonationActionType } from '../donations/donations_dto';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class ReceiptsDailyCronService {
  constructor(
    @InjectRepository(LoanActionEntity)
    private readonly loanActionsRepo: Repository<LoanActionEntity>,
    @InjectRepository(DepositsActionsEntity)
    private readonly depositsActionsRepo: Repository<DepositsActionsEntity>,
    @InjectRepository(MonthlyDepositsEntity)
    private readonly monthlyDepositsRepo: Repository<MonthlyDepositsEntity>,
    @InjectRepository(OrderReturnEntity)
    private readonly orderReturnRepo: Repository<OrderReturnEntity>,
    @InjectRepository(DonationsEntity)
    private readonly donationsRepo: Repository<DonationsEntity>,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 0 * * *', { timeZone: 'Asia/Jerusalem' })
  async sendDailyReceipts() {
    const targetDate = this.getIsraelDateString(-1);

    await this.sendLoanActionReceipts(targetDate);
    await this.sendDepositActionReceipts(targetDate);
    await this.sendMonthlyDepositReceipts(targetDate);
    await this.sendOrderReturnReceipts(targetDate);
    await this.sendDonationReceipts(targetDate);
  }

  private async sendLoanActionReceipts(targetDate: string) {
    const actions = await this.loanActionsRepo
      .createQueryBuilder('action')
      .leftJoinAndSelect('action.loan', 'loan')
      .leftJoinAndSelect('loan.user', 'user')
      .where('DATE(action.updated_at) = :targetDate', { targetDate })
      .orderBy('action.id', 'ASC')
      .getMany();

    for (const action of actions) {
      const loan = action.loan;
      const user = loan?.user;
      if (!this.canSendToUser(user)) continue;

      switch (action.action_type) {
        case LoanPaymentActionType.LOAN_CREATED: {
          const lines = [
            `׳”׳׳•׳•׳׳” ׳׳¡׳₪׳¨ ${loan.id} ׳ ׳•׳¦׳¨׳” ׳‘׳”׳¦׳׳—׳”.`,
            `׳׳¡׳₪׳¨ ׳×׳©׳׳•׳׳™׳: ${Math.ceil(loan.total_installments)}.`,
            `׳¡׳›׳•׳ ׳”׳”׳׳•׳•׳׳”: ${this.mailService.formatCurrency(loan.loan_amount)}.`,
            `׳¡׳›׳•׳ ׳”׳”׳—׳–׳¨ ׳”׳—׳•׳“׳©׳™: ${this.mailService.formatCurrency(
              loan.monthly_payment,
            )}.`,
            `׳™׳•׳ ׳”׳×׳©׳׳•׳: ${loan.payment_date ?? '-'} ׳‘׳—׳•׳“׳©.`,
          ];
          if (loan.first_payment_date) {
            lines.push(
              `׳×׳©׳׳•׳ ׳¨׳׳©׳•׳ ׳‘׳×׳׳¨׳™׳ ${this.formatDate(loan.first_payment_date)}.`,
            );
          }
          lines.push('׳‘׳•׳ ׳ ׳¦׳¢׳“ ׳™׳—׳“ ׳׳¢׳‘׳¨ ׳”׳™׳¢׳“.');
          await this.mailService.sendReceiptNotificationNow({
            to: user.email_address,
            fullName: this.userFullName(user),
            idNumber: user.id_number ?? '',
            title: '׳׳™׳©׳•׳¨ ׳”׳§׳׳× ׳”׳׳•׳•׳׳”',
            lines,
          });
          break;
        }
        case LoanPaymentActionType.PAYMENT: {
          const remainingPayments = loan.total_remaining_payments
          const lines = [
            `התקבל תשלום בסך ${this.mailService.formatCurrency(
              action.value,
            )} עבור הלוואה מספר ${loan.id}.`,
            `יתרה להחזר: ${this.mailService.formatCurrency(
              loan.remaining_balance,
            )}.`,
            `תשלומים נותרו: ${remainingPayments}.`,
          ];
          await this.mailService.sendReceiptNotificationNow({
            to: user.email_address,
            fullName: this.userFullName(user),
            idNumber: user.id_number ?? '',
            title: '׳×׳©׳׳•׳ ׳”׳׳•׳•׳׳”',
            lines,
          });

          if (Number(loan.remaining_balance) === 0) {
            await this.mailService.sendReceiptNotificationNow({
              to: user.email_address,
              fullName: this.userFullName(user),
              idNumber: user.id_number ?? '',
              title: '׳¡׳™׳•׳ ׳”׳׳•׳•׳׳”',
              lines: ['׳”׳”׳׳•׳•׳׳”  ׳׳¡ ' + loan.id + '׳ ׳¡׳’׳¨׳” ׳‘׳׳׳•׳׳”. ׳×׳•׳“׳”'],
            });
          }
          break;
        }
        case LoanPaymentActionType.AMOUNT_CHANGE: {
          const lines = [
            `׳¡׳›׳•׳ ׳”׳”׳׳•׳•׳׳”  ׳׳¡ ${loan.id}׳¢׳•׳“׳›׳ ׳‘-${this.mailService.formatCurrency(
              action.value,
            )}.`,
            `׳™׳×׳¨׳” ׳—׳“׳©׳” ׳׳”׳—׳–׳¨: ${this.mailService.formatCurrency(
              loan.remaining_balance,
            )}.`,
          ];
          await this.mailService.sendReceiptNotificationNow({
            to: user.email_address,
            fullName: this.userFullName(user),
            idNumber: user.id_number ?? '',
            title: '׳¢׳“׳›׳•׳ ׳¡׳›׳•׳ ׳”׳׳•׳•׳׳”',
            lines,
          });
          break;
        }
        case LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE: {
          const lines = [
            `׳”׳×׳©׳׳•׳ ׳”׳—׳•׳“׳©׳™  ׳׳”׳׳•׳•׳׳” ׳׳¡ ${loan.id}׳¢׳•׳“׳›׳ ׳׳¡׳ ${this.mailService.formatCurrency(
              action.value,
            )}.`,
          ];
          await this.mailService.sendReceiptNotificationNow({
            to: user.email_address,
            fullName: this.userFullName(user),
            idNumber: user.id_number ?? '',
            title: '׳¢׳“׳›׳•׳ ׳×׳©׳׳•׳ ׳—׳•׳“׳©׳™',
            lines,
          });
          break;
        }
        case LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE: {
          const lines = [
            `׳™׳•׳ ׳”׳×׳©׳׳•׳ ׳׳”׳׳•׳•׳׳” ׳׳¡ ${loan.id}׳¢׳•׳“׳›׳ ׳-${action.value} ׳‘׳—׳•׳“׳©.`,
          ];
          await this.mailService.sendReceiptNotificationNow({
            to: user.email_address,
            fullName: this.userFullName(user),
            idNumber: user.id_number ?? '',
            title: '׳¢׳“׳›׳•׳ ׳™׳•׳ ׳×׳©׳׳•׳ ׳”׳׳•׳•׳׳”',
            lines,
          });
          break;
        }
        default:
          break;
      }
    }
  }

  private async sendDepositActionReceipts(targetDate: string) {
    const actions = await this.depositsActionsRepo
      .createQueryBuilder('action')
      .leftJoinAndSelect('action.deposit', 'deposit')
      .leftJoinAndSelect('deposit.user', 'user')
      .where('DATE(COALESCE(action.update_date, action.date)) = :targetDate', {
        targetDate,
      })
      .orderBy('action.id', 'ASC')
      .getMany();

    for (const action of actions) {
      const deposit = action.deposit;
      const user = deposit?.user;
      if (!this.canSendToUser(user)) continue;

      if (action.action_type === DepositActionsType.InitialDeposit) {
        const lines = [
          `׳ ׳₪׳×׳—׳” ׳”׳₪׳§׳“׳” ׳׳¡׳₪׳¨ ${deposit.id}.`,
          `׳¢׳ ׳¡׳ ${this.mailService.formatCurrency(deposit.initialDeposit)}.`,
          `׳×׳׳¨׳™׳ ׳”׳—׳–׳¨: ${
            deposit.end_date ? this.formatDate(deposit.end_date) : '-'
          }.`,
          '׳×׳•׳“׳” ׳¨׳‘׳”.',
          '׳‘׳–׳›׳•׳× ׳”׳”׳₪׳§׳“׳” ׳”׳×׳–׳¨׳™׳ ׳©׳ ׳”׳’׳"׳— ׳’׳“׳.',
          '׳•׳׳ ׳• ׳ ׳¢׳©׳” ׳׳׳׳¥ ׳׳”׳—׳–׳™׳¨ ׳׳× ׳”׳”׳₪׳§׳“׳” ׳‘׳×׳׳¨׳™׳ ׳”׳”׳—׳–׳¨.',
        ];
        await this.mailService.sendReceiptNotificationNow({
          to: user.email_address,
          fullName: this.userFullName(user),
          idNumber: user.id_number ?? '',
          title: '׳׳™׳©׳•׳¨ ׳”׳§׳׳× ׳”׳₪׳§׳“׳”',
          lines,
        });
        continue;
      }

      if (action.action_type === DepositActionsType.AddToDeposit) {
        const lines = [
          `׳‘׳•׳¦׳¢׳” ׳”׳•׳¡׳₪׳” ׳׳”׳₪׳§׳“׳” ׳‘׳¡׳ ${this.mailService.formatCurrency(
            action.amount ?? 0,
          )}.`,
          `׳™׳×׳¨׳× ׳”׳”׳₪׳§׳“׳”: ${this.mailService.formatCurrency(
            deposit.current_balance,
          )}.`,
        ];
        await this.mailService.sendReceiptNotificationNow({
          to: user.email_address,
          fullName: this.userFullName(user),
          idNumber: user.id_number ?? '',
          title: '׳”׳•׳¡׳₪׳” ׳׳”׳₪׳§׳“׳”',
          lines,
        });
        continue;
      }

      if (action.action_type === DepositActionsType.RemoveFromDeposit) {
        const lines = [
          `׳‘׳•׳¦׳¢׳” ׳׳©׳™׳›׳” ׳׳”׳₪׳§׳“׳” ׳‘׳¡׳ ${this.mailService.formatCurrency(
            action.amount ?? 0,
          )}.`,
          `׳™׳×׳¨׳× ׳”׳”׳₪׳§׳“׳”: ${this.mailService.formatCurrency(
            deposit.current_balance,
          )}.`,
        ];
        await this.mailService.sendReceiptNotificationNow({
          to: user.email_address,
          fullName: this.userFullName(user),
          idNumber: user.id_number ?? '',
          title: '׳׳©׳™׳›׳” ׳׳”׳₪׳§׳“׳”',
          lines,
        });

        if (Number(deposit.current_balance) === 0) {
          await this.mailService.sendReceiptNotificationNow({
            to: user.email_address,
            fullName: this.userFullName(user),
            idNumber: user.id_number ?? '',
            title: '׳¡׳’׳™׳¨׳× ׳”׳₪׳§׳“׳”',
            lines: ['׳”׳”׳₪׳§׳“׳” ׳ ׳¡׳’׳¨׳” ׳•׳”׳™׳×׳¨׳” ׳”׳’׳™׳¢׳” ׳׳׳₪׳¡.'],
          });
        }
        continue;
      }

      if (action.action_type === DepositActionsType.ChangeReturnDate) {
        const lines = [
          `׳™׳•׳ ׳”׳”׳—׳–׳¨ ׳¢׳•׳“׳›׳ ׳׳×׳׳¨׳™׳ ${this.formatDate(
            action.update_date ?? action.date,
          )}.`,
        ];
        await this.mailService.sendReceiptNotificationNow({
          to: user.email_address,
          fullName: this.userFullName(user),
          idNumber: user.id_number ?? '',
          title: '׳¢׳“׳›׳•׳ ׳™׳•׳ ׳”׳—׳–׳¨ ׳”׳₪׳§׳“׳”',
          lines,
        });
      }
    }
  }

  private async sendMonthlyDepositReceipts(targetDate: string) {
    const deposits = await this.monthlyDepositsRepo
      .createQueryBuilder('deposit')
      .leftJoinAndSelect('deposit.user', 'user')
      .leftJoinAndSelect('user.payment_details', 'payment_details')
      .where('DATE(deposit.updated_at) = :targetDate', { targetDate })
      .orderBy('deposit.id', 'ASC')
      .getMany();

    for (const deposit of deposits) {
      const user = deposit.user;
      if (!this.canSendToUser(user)) continue;

      const lines = [
        `׳”׳×׳§׳‘׳ ׳×׳©׳׳•׳ ׳“׳׳™ ׳—׳‘׳¨ ׳‘׳¡׳ ${this.mailService.formatCurrency(
          deposit.amount,
        )} ׳׳—׳•׳“׳© ${deposit.month}/${deposit.year}.`,
      ];

      const monthlyBalance = user?.payment_details?.monthly_balance;
      if (typeof monthlyBalance === 'number' && monthlyBalance < 0) {
        lines.push(
          `׳™׳×׳¨׳× ׳—׳•׳‘: ${this.mailService.formatCurrency(
            Math.abs(monthlyBalance),
          )}.`,
          '׳™׳© ׳׳”׳¡׳“׳™׳¨ ׳׳× ׳×׳©׳׳•׳ ׳”׳—׳•׳‘ ׳‘׳”׳§׳“׳.',
        );
      }

      await this.mailService.sendReceiptNotificationNow({
        to: user.email_address,
        fullName: this.userFullName(user),
        idNumber: user.id_number ?? '',
        title: '׳׳™׳©׳•׳¨ ׳×׳©׳׳•׳ ׳“׳׳™ ׳—׳‘׳¨',
        lines,
      });
    }
  }

  private async sendOrderReturnReceipts(targetDate: string) {
    const created = await this.orderReturnRepo
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .where('DATE(record.updated_at) = :targetDate', { targetDate })
      .andWhere('record.paid = :paid', { paid: false })
      .orderBy('record.id', 'ASC')
      .getMany();

    for (const record of created) {
      const user = record.user;
      if (!this.canSendToUser(user)) continue;
      const lines = [
        `׳ ׳•׳¦׳¨ ׳”׳—׳–׳¨ ׳”׳•׳¨׳׳× ׳§׳‘׳¢ ׳‘׳¡׳ ${this.mailService.formatCurrency(
          record.amount,
        )}.`,
      ];
      await this.mailService.sendReceiptNotificationNow({
        to: user.email_address,
        fullName: this.userFullName(user),
        idNumber: user.id_number ?? '',
        title: '׳׳™׳©׳•׳¨ ׳”׳—׳–׳¨ ׳”׳•׳¨׳׳× ׳§׳‘׳¢',
        lines,
      });
    }

    const paid = await this.orderReturnRepo
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .where('record.paid = :paid', { paid: true })
      .andWhere('DATE(record.updated_at) = :targetDate', { targetDate })
      .orderBy('record.id', 'ASC')
      .getMany();

    for (const record of paid) {
      const user = record.user;
      if (!this.canSendToUser(user)) continue;
      const lines = [
        `׳©׳•׳׳ ׳”׳—׳–׳¨ ׳”׳•׳¨׳׳× ׳§׳‘׳¢ ׳‘׳¡׳ ${this.mailService.formatCurrency(
          record.amount,
        )}.`,
      ];
      await this.mailService.sendReceiptNotificationNow({
        to: user.email_address,
        fullName: this.userFullName(user),
        idNumber: user.id_number ?? '',
        title: '׳×׳©׳׳•׳ ׳”׳—׳–׳¨ ׳”׳•׳¨׳׳× ׳§׳‘׳¢',
        lines,
      });
    }
  }

  private async sendDonationReceipts(targetDate: string) {
    const donations = await this.donationsRepo
      .createQueryBuilder('donation')
      .leftJoinAndSelect('donation.user', 'user')
      .leftJoinAndSelect('donation.fund', 'fund')
      .where('donation.action = :action', {
        action: DonationActionType.donation,
      })
      .andWhere('DATE(donation.updated_at) = :targetDate', { targetDate })
      .orderBy('donation.id', 'ASC')
      .getMany();

    for (const donation of donations) {
      const user = donation.user;
      if (!this.canSendToUser(user)) continue;

      const reason = String(donation.donation_reason ?? '').trim();
      const isEquity = reason.toLowerCase() === 'equity';
      const fundLabel = isEquity
        ? '׳§׳¨׳ ׳”׳’׳"׳—'
        : `׳§׳¨׳ ${String(donation.fund?.name ?? reason).trim()}`;

      await this.mailService.sendDonationReceiptNow({
        to: user.email_address,
        fullName: this.userFullName(user),
        idNumber: user.id_number ?? '',
        amount: Number(donation.amount ?? 0),
        fundLabel,
      });
    }
  }

  private canSendToUser(user?: UserEntity | null): user is UserEntity {
    if (!user) return false;
    if (user.notify_receipts === false) return false;
    if (!user.email_address) return false;
    return true;
  }

  private userFullName(user: UserEntity) {
    return `${user.first_name} ${user.last_name}`.trim() || '׳׳§׳•׳— ׳™׳§׳¨';
  }

  private formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('he-IL');
  }

  private getIsraelDateString(offsetDays = 0): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jerusalem',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);
    const base = new Date(Date.UTC(year, month - 1, day + offsetDays));
    return base.toISOString().slice(0, 10);
  }
}

