import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addMonths } from 'date-fns';
import { UserEntity } from '../users/user.entity';
import { LoanEntity } from '../loans/Entity/loans.entity';
import { RoleMonthlyRateEntity } from '../role_monthly_rates/Entity/role_monthly_rates.entity';



@Injectable()
export class FundsFlowService {
  constructor(


    @InjectRepository(LoanEntity)
    private readonly loansRepo: Repository<LoanEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(RoleMonthlyRateEntity)
    private readonly rateRepository: Repository<RoleMonthlyRateEntity>,
  ) {}

  /**
   * מחזירה סה"כ הכנסות (inflow) בין שני תאריכים
   */
async calculateTotalInflows(
    startDate: Date,
    endDate: Date = new Date(),
  ): Promise<number> {
    if (endDate < startDate) {
      throw new BadRequestException('End date must be on or after start date');
    }

    // 1. Load all monthly rates, ordered by effective_from ascending
    const allRates = await this.rateRepository.find({
      relations: ['role'],
      order: { effective_from: 'ASC' },
    });

    // 2. Load all users with their payment details and full role history
    const users = await this.usersRepo.find({
      relations: ['payment_details', 'roleHistory', 'roleHistory.role'],
    });

    let totalInflows = 0;

    for (const user of users) {
      // 3. Determine the charge day of month
      const rawCharge = user.payment_details?.charge_date;
      const chargeDay = parseInt(rawCharge as string, 10);
      if (!chargeDay || chargeDay < 1 || chargeDay > 31) {
        // skip users without a valid charge day
        continue;
      }

      // 4. Sort this user's role history by start date ascending
      const roleHistory = (user.roleHistory || []).sort(
        (a, b) => a.from_date.getTime() - b.from_date.getTime(),
      );
      if (roleHistory.length === 0) {
        // skip users with no recorded role changes
        continue;
      }

      // 5. Compute month indices for loop
      const startYM = startDate.getFullYear() * 12 + startDate.getMonth();
      const endYM   = endDate.getFullYear()   * 12 + endDate.getMonth();

      // 6. For each month index in [startYM..endYM]:
      for (let ym = startYM; ym <= endYM; ym++) {
        const year  = Math.floor(ym / 12);
        const month = ym % 12; // 0 = January, ..., 11 = December

        // 6a. Compute the billing date for this month
        const billingDate = new Date(year, month, chargeDay);
        if (billingDate < startDate || billingDate > endDate) {
          // not within the requested range
          continue;
        }

        // 6b. Find which role was active on the first of this month
        const monthStart = new Date(year, month, 1);
        const activeRecord = roleHistory
          .filter(r => r.from_date.getTime() <= monthStart.getTime())
          .sort(
            (a, b) =>
              b.from_date.getTime() - a.from_date.getTime(),
          )[0];
        if (!activeRecord) {
          // no role yet assigned
          continue;
        }

        // 6c. Find the most recent rate for that role on or before monthStart
        const applicableRate = allRates
          .filter(r =>
            r.role.id === activeRecord.role.id &&
            r.effective_from.getTime() <= monthStart.getTime(),
          )
          .pop(); // last in the ascending-effective_from array
        if (!applicableRate) {
          // no rate defined yet
          continue;
        }

        // 6d. Accumulate
        totalInflows += applicableRate.amount;
      }
    }
    console.log(totalInflows)
    return totalInflows;
  }


  /**
   * מחזירה סה"כ הוצאות (outflow) מהלוואות קיימות ו/או הלוואה חדשה בין שני תאריכים
   * @param newLoan אופציונלי: הלוואה חדשה להצטרף לסימולציה
   */
  async calculateTotalOutflows(
    from: Date,
    to: Date,
    newLoan?: LoanEntity,
  ): Promise<number> {
    if (to < from) throw new BadRequestException('End date must be after start date');
    const existing = await this.loansRepo.find({ where: { isActive: true } });
    const loans = newLoan ? [...existing, newLoan] : existing;
    let total = 0;
    for (const loan of loans) {
      const payDay = loan.payment_date;
      const monthlyPayment = loan.monthly_payment;
      let balance = loan.remaining_balance ?? loan.loan_amount;
      // מצא תשלום ראשון בתחום התאריכים
      let nextPay = new Date(from.getFullYear(), from.getMonth(), payDay);
      if (nextPay < from) {
        nextPay = addMonths(nextPay, 1);
      }
      while (nextPay <= to && balance > 0) {
        const amt = Math.min(monthlyPayment, balance);
        total += amt;
        balance -= amt;
        nextPay = addMonths(nextPay, 1);
      }
    }
    return total;
  }

  /**
   * מחזירה את הסכומים הכוללים של inflow ו־outflow בין שני תאריכים
   * כולל סימולציה על הלוואה חדשה אם נשלחה
   */
  async getCashFlowTotals(
    from: Date,
    to: Date,
    newLoan?: LoanEntity,
  ): Promise<{ totalInflows: number; totalOutflows: number }> {
    const [totalInflows, totalOutflows] = await Promise.all([
      this.calculateTotalInflows(from, to),
      this.calculateTotalOutflows(from, to, newLoan),
    ]);
    return { totalInflows, totalOutflows };
  }
}
