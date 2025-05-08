import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addMonths } from 'date-fns';
import { MonthlyRatesEntity } from '../monthly_rates/monthly_rates.entity';
import { LoanEntity } from './loans.entity';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class FundsFlowService {
  constructor(
    @InjectRepository(MonthlyRatesEntity)
    private readonly ratesRepo: Repository<MonthlyRatesEntity>,

    @InjectRepository(LoanEntity)
    private readonly loansRepo: Repository<LoanEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  /**
   * מחזירה סה"כ הכנסות (inflow) בין שני תאריכים
   */
  async calculateTotalInflows(from: Date, to: Date): Promise<number> {
    if (to < from) throw new BadRequestException('End date must be after start date');
    const rates = await this.ratesRepo.find({ order: { year: 'ASC', month: 'ASC' } });
    const users = await this.usersRepo.find({ relations: ['payment_details'] });
    let total = 0;
    for (const user of users) {
      const raw = user.payment_details?.charge_date;
      const chargeDay = parseInt(raw as string, 10);
      if (!chargeDay || chargeDay < 1 || chargeDay > 31) continue;
      let current = new Date(from.getFullYear(), from.getMonth(), 1);
      while (current <= to) {
        const rate = rates
          .filter(r => r.role === user.role)
          .filter(r =>
            r.year < current.getFullYear() ||
            (r.year === current.getFullYear() && r.month - 1 <= current.getMonth()),
          )
          .pop();
        if (rate) {
          const eventDate = new Date(current.getFullYear(), current.getMonth(), chargeDay);
          if (eventDate >= from && eventDate <= to) {
            total += rate.amount;
          }
        }
        current = addMonths(current, 1);
      }
    }
    return total;
  }

  /**
   * מחזירה סה"כ הוצאות (outflow) מהלוואות קיימות ו/או הלוואה חדשה בין שני תאריכים
   * @param newLoan אופציונלי: הלוואה חדשה להצטרף לסימולציה
   */
  async calculateTotalOutflows(
    from: Date,
    to: Date,
    newLoan?: Partial<LoanEntity>,
  ): Promise<number> {
    if (to < from) throw new BadRequestException('End date must be after start date');
    const existing = await this.loansRepo.find({ where: { isActive: true } });
    const loansToSimulate: LoanEntity[] = [...existing];
    if (newLoan) {
      const temp = new LoanEntity();
      temp.loan_amount = newLoan.loan_amount!;
      temp.monthly_payment = newLoan.monthly_payment!;
      temp.payment_date = newLoan.payment_date!;
      temp.remaining_balance = newLoan.remaining_balance ?? newLoan.loan_amount!;
      temp.isActive = true;
      loansToSimulate.push(temp);
    }
    let total = 0;
    for (const loan of loansToSimulate) {
      let balance = loan.remaining_balance ?? loan.loan_amount;
      let nextPay = new Date(from.getFullYear(), from.getMonth(), loan.payment_date);
      if (nextPay < from) nextPay = addMonths(nextPay, 1);
      while (nextPay <= to && balance > 0) {
        const amt = Math.min(loan.monthly_payment, balance);
        total += amt;
        balance -= amt;
        nextPay = addMonths(nextPay, 1);
      }
    }
    return total;
  }

  async getCashFlowTotals(
    from: Date,
    to: Date,
    newLoan?: Partial<LoanEntity>,
  ): Promise<{ totalInflows: number; totalOutflows: number }> {
    const [totalInflows, totalOutflows] = await Promise.all([
      this.calculateTotalInflows(from, to),
      this.calculateTotalOutflows(from, to, newLoan),
    ]);
    console.log("total inflows", totalInflows, "total outflows", totalOutflows);
    return { totalInflows, totalOutflows };
  }
}
