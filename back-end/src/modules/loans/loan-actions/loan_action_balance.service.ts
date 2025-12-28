// src/services/loan-action-balance.service.ts
import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getDaysInMonth } from 'date-fns';
import { LoanEntity } from '../Entity/loans.entity';
import { LoanActionEntity } from './Entity/loan_actions.entity';
import { PaymentDetailsEntity } from '../../users/payment-details/payment_details.entity';
import { LoanActionsService } from './loan_actions.service';
import { LoansService } from '../loans.service';
import { LoanPaymentActionType, PaymentEvent } from '../loan-dto/loanTypes';
import { log } from 'console';

@Injectable()
export class LoanActionBalanceService {
  constructor(
    @InjectRepository(LoanEntity)
    private readonly loansRepo: Repository<LoanEntity>,
    @InjectRepository(LoanActionEntity)
    private readonly actionsRepo: Repository<LoanActionEntity>,
    @InjectRepository(PaymentDetailsEntity)
    private readonly paymentDetailsRepo: Repository<PaymentDetailsEntity>,
    @Inject(forwardRef(() => LoanActionsService))
    private readonly loanActionsService: LoanActionsService,
    private readonly loansService: LoansService,
  ) {}

  async computeLoanNetBalance(loanId: number): Promise<number> {
    console.log('Computing net balance for loan ID:', loanId);
    // 1. טענת הלוואה + לווה
    const loan = await this.loansRepo.findOne({
      where: { id: loanId },
      relations: ['user'],
    });
    if (!loan) throw new Error('Loan not found');

    const principal = loan.loan_amount; // קרן
    const startDate = new Date(loan.loan_date); // תאריך התחלה
    const firstMonthlyInstallment = loan.initial_monthly_payment; // תעריף התשלום החודשי ההתחלתי
    const paymentDay = loan.payment_date; // יום בחודש לתשלום (1–28)
    const today = new Date();

    // 2. שליפת כל האירועים (תשלומים + שינויים בתעריף)
    const raw = (await this.loanActionsService.getLoanPayments(loanId)) ?? [];
    const events: PaymentEvent[] = raw.map((e) => ({
      date: new Date(e.date),
      amount: e.value,
      action_type: e.action_type,
    }));

    // 3. הפרדה למערך של שינויים בתעריף בלבד, ממוינים
    const rateChanges = events
      .filter(
        (e) => e.action_type === LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE,
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // 4. בניית לוח התאריכים הצפוי לתשלום חודשי (מתחילים מהחודש הבא)
    const dueDates: Date[] = [];
    let year = startDate.getFullYear();
    let month = startDate.getMonth() + 1; // חודש הבא
    while (true) {
      // חשב יום בתור מינימום בין paymentDay לבין מספר הימים בחודש
      const daysInThisMonth = getDaysInMonth(new Date(year, month, 1));
      const day = Math.min(paymentDay, daysInThisMonth);

      const nextDue = new Date(year, month, day);
      if (nextDue > today) break;

      dueDates.push(nextDue);

      // מעבר לחודש הבא
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    // 5. חישוב מה ששולם בפועל
    const totalPaid = events
      .filter(
        (e) =>
          e.action_type === LoanPaymentActionType.PAYMENT && e.date <= today,
      )
      .reduce((sum, e) => sum + e.amount, 0);

    // 6. חישוב מה שהייתי אמור לשלם על פי ה־dueDates והתעריפים
    let expectedPaid = 0;
    for (const due of dueDates) {
      const lastChange = rateChanges.filter((e) => e.date <= due).pop();
      const rate = lastChange ? lastChange.amount : firstMonthlyInstallment;
      expectedPaid += rate;
      if (expectedPaid >= principal) {
        expectedPaid = principal;
        break;
      }
    }

    // 7. חישוב ה־net balance
    const netBalance = totalPaid - expectedPaid;

    // 8. שמירת היתרה ב־PaymentDetails
    const pd = await this.paymentDetailsRepo.findOne({
      where: { user: { id: loan.user.id } },
    });
    if (!pd) throw new Error('Payment details not found for user');
    if (loan.isActive) {
      pd.loan_balances = [
        ...pd.loan_balances.filter((x) => x.loanId !== loan.id),
        { loanId: loan.id, balance: netBalance },
      ];
      await this.paymentDetailsRepo.save(pd);
    }
    // 9. רישום לוג ושמירה סופית
    await this.loansService.recordLoanBalance(loan.id, netBalance);
    console.log({ expectedPaid }, { totalPaid }, { netBalance });
    return netBalance;
  }
}
