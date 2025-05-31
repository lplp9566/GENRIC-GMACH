import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addMonths } from 'date-fns';
import { MonthlyRatesEntity } from '../monthly_rates/monthly_rates.entity';
import { LoanEntity } from './Entity/loans.entity';
import { UserEntity } from '../users/user.entity';
import { DepositsService } from '../deposits/deposits.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';

@Injectable()
export class FundsFlowService {
  constructor(
    @InjectRepository(MonthlyRatesEntity)
    private readonly ratesRepo: Repository<MonthlyRatesEntity>,

    @InjectRepository(LoanEntity)
    private readonly loansRepo: Repository<LoanEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly depositsService: DepositsService,
    private readonly fundsOverviewService: FundsOverviewService
  ) {}

  async calculateTotalMonthlyInflows(from: Date, to: Date): Promise<number> {
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
  async calculateLoanPaymentSum(
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

  async getCashFlowTotals(from: Date, newLoan?: Partial<LoanEntity>) {
    const fund_details = await this.fundsOverviewService.getFundDetails();
    if(fund_details.available_funds<newLoan?.loan_amount!){
      throw new BadRequestException('אתה לא יכול להוציא הלוואה על  ' + (fund_details.available_funds - newLoan?.loan_amount!) + ' ש"ח, במערכת יש כרגע ' + fund_details.available_funds + ' ש"ח');
    }
    const deposits = await this.depositsService.getDepositsActive();
    if(deposits.length == 0) return true;
    let allGood = true;
    let totalInflows = 0;
    const uniqueDates = [
      ...new Set(deposits.map(d => new Date(d.end_date).toISOString()))
    ]
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());
    // console.log(uniqueDates,"uniqueDates")
    for (const checkpointDate of uniqueDates) {
      // שלב 2: סך כל ההפקדות שפוקעות עד התאריך הזה
      const relevantDeposits = deposits.filter(d => new Date(d.end_date) <= checkpointDate);
      const requiredBalance = relevantDeposits.reduce((sum, d) => sum + d.current_balance, 0) - totalInflows;
      // console.log(requiredBalance,"requiredBalance")
      // שלב 3: חישוב תזרים עד אותו תאריך
      const [monthlyInflowsTotal, loanPaymentsInflowsTotal] = await Promise.all([
        this.calculateTotalMonthlyInflows(from, checkpointDate),
        this.calculateLoanPaymentSum(from, checkpointDate, newLoan),
      ]);
      const availableFunds = fund_details.available_funds;
      const availableFundsAfterLoan = fund_details.available_funds - newLoan?.loan_amount!;
      // console.log(availableFunds,"available_funds")
      // console.log(availableFundsAfterLoan,"availableFundsAfterLoan")
      // console.log(monthlyInflowsTotal,"monthlyInflowsTotal")
      // console.log(loanPaymentsInflowsTotal,"loanPaymentsInflowsTotal")
      const availableCash = monthlyInflowsTotal + availableFundsAfterLoan + loanPaymentsInflowsTotal;
      // console.log(availableCash,"availableCash")
      if (availableCash < requiredBalance) {
        // console.log("❌ עד", checkpointDate.toISOString(), "is", availableCash, "need", requiredBalance);
        allGood = false;
        if(availableCash< requiredBalance){
          throw new BadRequestException(`אין מספיק כסף במערכת להוציא הלוואה על סכום זה, עד ${checkpointDate.toISOString().slice(0, 10)} יהיה זמין רק  ${availableCash} שח, וצריך ${requiredBalance} שח`);
        }
        else {
          throw new BadRequestException(`אתה יכול להוציא הלוואה רק על סכום ${availableCash-requiredBalance} ש"ח, עד ${checkpointDate.toISOString()}   יהיה  בקרן רק  ${availableCash} שח, וצריך ${requiredBalance} שח`);
        }
        // throw new BadRequestException(`אתה יכול להוציא הלוואה רק על סכום ${availableCash-requiredBalance} `);        
      } else {
        // console.log("✅ עד", checkpointDate.toISOString(),"is", availableCash, "need", requiredBalance);
        totalInflows += requiredBalance;
      }
    }
    return allGood ;
  }
  
}  
