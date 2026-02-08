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
import { updateMonthlyDepositDto } from './monthly_deposits.controller';
import { log } from 'console';
import { MailService } from '../mail/mail.service';

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
    private readonly mailService: MailService,
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
      const monthlyBalance = await this.usersService.updateUserMonthlyBalance(user);

      const lines = [
        `התקבל תשלום דמי חבר בסך ${this.mailService.formatCurrency(
          payment_details.amount,
        )} לחודש ${month}/${year}.`,
      ];
      if (monthlyBalance != null && monthlyBalance < 0) {
        lines.push(
          `יתרת חוב: ${this.mailService.formatCurrency(Math.abs(monthlyBalance))}.`,
          'יש להסדיר את תשלום החוב בהקדם.',
        );
      }

      await this.maybeSendReceiptEmail(
        user,
        'אישור תשלום דמי חבר',
        lines,
      );

      return { message: `Deposit recorded successfully.` };
  
    } catch (error) {
      console.error('❌ Error recording deposit:', error.message);
      throw new BadRequestException(error.message);
    }
  }
 async updateMonthlyDeposit(id: number, payment_details: updateMonthlyDepositDto) {
  const { amount: newAmount, deposit_date: newDepositDate } = payment_details;
  const newDate = new Date(newDepositDate);

  if (newAmount <= 0) {
    throw new BadRequestException('Amount must be greater than zero');
  }

  // 1) מבצעים עדכון בתוך טרנזקציה
  const updatedDeposit = await this.monthlyDepositsRepository.manager.transaction(
    async (manager) => {
      const existing = await manager.findOne(MonthlyDepositsEntity, {
        where: { id },
        relations: { user: true },
      });

      if (!existing) throw new BadRequestException('Deposit not found');

      const oldAmount = existing.amount;
      const oldDate = existing.deposit_date;
      const oldYear = getYearFromDate(oldDate);
      const newYear = getYearFromDate(newDate);
      const deltaAmount = newAmount - oldAmount;
      const user = existing.user;

      // מעדכנים את התרומה
      existing.amount = newAmount;
      existing.deposit_date = newDate;
      existing.year = newYear;
      existing.month = getMonthFromDate(newDate);
      existing.description = payment_details.description;
      existing.payment_method = payment_details.payment_method;
      // שומרים בתוך הטרנזקציה
      await manager.save(existing);

      // מחזירים את השורה המעודכנת
      return existing;
    },
  );

  // 2) רק אחרי שהטרנזקציה הסתיימה (commit) מחשבים בלאנס
  await this.usersService.updateUserMonthlyBalance(updatedDeposit.user);

  // אופציונלי: להחזיר מחדש מה-DB
  return this.monthlyDepositsRepository.findOne({
    where: { id },
    relations: { user: true },
  });
}

  private async maybeSendReceiptEmail(
    user: any,
    title: string,
    lines: string[],
  ) {
    if (!user) return;
    if (user.notify_receipts === false) return;
    if (!user.email_address) return;

    const fullName = `${user.first_name} ${user.last_name}`.trim();
    await this.mailService.sendReceiptNotification({
      to: user.email_address,
      fullName: fullName || 'לקוח יקר',
      idNumber: user.id_number ?? '',
      title,
      lines,
    });
  }

async deleteMonthlyDeposit(id: number) {
  // 1) טרנזקציה למחיקה + עדכוני סכומים
  const deletedUser = await this.monthlyDepositsRepository.manager.transaction(
    async (manager) => {
      const existing = await manager.findOne(MonthlyDepositsEntity, {
        where: { id },
        relations: { user: true },
      });
      if (!existing) throw new BadRequestException('Deposit not found');
      const oldAmount = existing.amount;
      const oldYear = getYearFromDate(existing.deposit_date);
      const user = existing.user;
      await manager.delete(MonthlyDepositsEntity, { id });

      return user; 
    },
  );

  await this.usersService.updateUserMonthlyBalance(deletedUser);

  return { message: 'Deposit deleted successfully.' };
}
}  
