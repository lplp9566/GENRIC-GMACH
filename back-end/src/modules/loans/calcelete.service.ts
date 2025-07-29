import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addMonths } from 'date-fns';
import { LoanEntity } from './Entity/loans.entity';
import { UserEntity } from '../users/user.entity';
import { DepositsService } from '../deposits/deposits.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { RoleMonthlyRateEntity } from '../role_monthly_rates/Entity/role_monthly_rates.entity';

@Injectable()
export class FundsFlowService {
  constructor(


    @InjectRepository(LoanEntity)
    private readonly loansRepo: Repository<LoanEntity>,
        @InjectRepository(RoleMonthlyRateEntity)
        private readonly rateRepository: Repository<RoleMonthlyRateEntity>,
        
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly depositsService: DepositsService,
    private readonly fundsOverviewService: FundsOverviewService,

  ) {}

async calculateTotalInflows(
  startDate: Date,
  endDate: Date = new Date(),
): Promise<number> {
  if (endDate < startDate) {
    throw new BadRequestException('End date must be on or after start date');
  }

  // console.log(`🔄 Calculating expected payments from ${startDate.toISOString().slice(0,10)} to ${endDate.toISOString().slice(0,10)}`);

  // 1. Load all monthly rates
  const allRates = await this.rateRepository.find({
    relations: ['role'],
    order: { effective_from: 'ASC' },
  });
  // console.log(`📊 Retrieved ${allRates.length} monthly rates`);

  // 2. Load all users
  const users = await this.usersRepo.find({
    relations: ['payment_details', 'roleHistory', 'roleHistory.role'],
  });
  // console.log(`👥 Retrieved ${users.length} users`);

  let totalInflows = 0;

  for (const user of users) {
    // console.log(`\n--- User ID=${user.id} (${user.first_name} ${user.last_name}) ---`);

    // 3. Determine the charge day
    const chargeDate = user.payment_details?.charge_date;
    // console.log(`🗓 Raw charge day: ${rawCharge}`);
    if (!chargeDate || chargeDate < 1 || chargeDate > 31) {
      // console.log(`⚠️ Skipping: invalid charge day`);
      continue;
    }
    // console.log(`✔ Valid charge day: ${chargeDay}`);

    // 4. Sort this user's role history
    const roleHistory = (user.roleHistory || []).sort(
      (a, b) => a.from_date.getTime() - b.from_date.getTime(),
    );
    // console.log(`📜 Role history entries: ${roleHistory.length}`);
    if (roleHistory.length === 0) {
      // console.log(`⚠️ Skipping: no role history`);
      continue;
    }

    // 5. Compute month indices
    const startYM = startDate.getFullYear() * 12 + startDate.getMonth();
    const endYM   = endDate.getFullYear()   * 12 + endDate.getMonth();
    // console.log(`📆 Month indices from ${startYM} to ${endYM}`);

    // 6. Loop per month
    for (let ym = startYM; ym <= endYM; ym++) {
      const year  = Math.floor(ym / 12);
      const month = ym % 12;
      // console.log(`\n  🔍 Processing month: ${year}-${(month+1).toString().padStart(2,'0')}`);

      // 6a. Compute billing date
      const billingDate = new Date(year, month, chargeDate);
      if (billingDate < startDate || billingDate > endDate) {
        // console.log(`    ⚠️ Skipping: billing date ${billingDate.toISOString().slice(0,10)} out of range`);
        continue;
      }
      // console.log(`    ✔ Billing date within range: ${billingDate.toISOString().slice(0,10)}`);

      // 6b. Find active role at start of month
      const monthStart = new Date(year, month, 1);
      const activeRecord = roleHistory
        .filter(r => r.from_date.getTime() <= monthStart.getTime())
        .sort((a, b) => b.from_date.getTime() - a.from_date.getTime())[0];
      if (!activeRecord) {
        // console.log(`    ⚠️ Skipping: no active role`);
        continue;
      }
      // console.log(`    ✔ Active role ID: ${activeRecord.role.id}`);

      // 6c. Find applicable rate
      const applicableRate = allRates
        .filter(r =>
          r.role.id === activeRecord.role.id &&
          r.effective_from.getTime() <= monthStart.getTime(),
        )
        .pop();
      if (!applicableRate) {
        console.log(`    ⚠️ Skipping: no rate defined`);
        continue;
      }
      // console.log(`    💰 Using rate: ${applicableRate.amount}`);

      // 6d. Accumulate
      totalInflows += applicableRate.amount;
      // console.log(`    🧮 Accumulated total: ${totalInflows}`);
    }
  }

  console.log(`\n🏁 Final total expected inflows: ${totalInflows}`);
  return totalInflows;
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
    if(fund_details.available_funds < newLoan?.loan_amount!){
      throw new BadRequestException('אתה לא יכול להוציא הלוואה על  ' + (newLoan!.loan_amount) + ' ש"ח, במערכת יש כרגע ' + fund_details.available_funds + ' ש"ח');
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
      if(checkpointDate<from) continue;
      const [monthlyInflowsTotal, loanPaymentsInflowsTotal] = await Promise.all([
        this.calculateTotalInflows(from, checkpointDate),
        this.calculateLoanPaymentSum(from, checkpointDate, newLoan),
      ]);
      const availableFunds = fund_details.available_funds;
      const availableFundsAfterLoan = fund_details.available_funds - newLoan?.loan_amount!;
      // console.log(availableFunds,"available_funds")
      // console.log(availableFundsAfterLoan,"availableFundsAfterLoan")
      console.log(monthlyInflowsTotal,"monthlyInflowsTotal")
      // console.log(loanPaymentsInflowsTotal,"loanPaymentsInflowsTotal")
      const availableCash = monthlyInflowsTotal + availableFundsAfterLoan + loanPaymentsInflowsTotal;
      // console.log(availableCash,"availableCash")
      if (availableCash < requiredBalance) {
        // console.log("❌ עד", checkpointDate.toISOString(), "is", availableCash, "need", requiredBalance);
        allGood = false;
        if(availableCash< requiredBalance){
          throw new BadRequestException(`אם תאשר הלוואה זו לא תעמוד בהחזרי ההפקדות , עד ${checkpointDate.toISOString().slice(0, 10)} יהיה זמין רק  ${availableCash} שח, וצריך ${requiredBalance} שח`);
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
