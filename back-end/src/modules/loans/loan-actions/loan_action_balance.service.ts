import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoanActionEntity } from "./Entity/loan_actions.entity";
import { PaymentDetailsEntity } from "../../users/payment-details/payment_details.entity"
import { LoanPaymentActionType, PaymentEvent } from "../loan-dto/loanTypes";
import { LoanActionsService } from "./loan_actions.service";
import { differenceInMonths } from "date-fns";
import { LoanEntity } from "../Entity/loans.entity";
import { LoansService } from "../loans.service";

@Injectable()
export class LoanActionBalanceService{
    constructor(
           @InjectRepository(LoanEntity)
            private readonly loansRepo: Repository<LoanEntity>,
            @InjectRepository(LoanActionEntity)
            private readonly paymentsRepo: Repository<LoanActionEntity>,
            @InjectRepository(PaymentDetailsEntity)
            private readonly paymentDetailsRepo: Repository<PaymentDetailsEntity>,
            @Inject(forwardRef(() => LoanActionsService))
            private readonly LoanActionService:LoanActionsService,
            private readonly loanService: LoansService
    ){}
    async computeLoanNetBalance(loanId: number): Promise<number> {
        const loan = await this.loansRepo.findOne({
          where: { id: loanId },
          relations: ['user'],
        });
        if (!loan) throw new Error('Loan not found');
    
        // 2. הגדרות בסיס
        const loanStartDate = new Date(loan.loan_date);
        const principal = loan.loan_amount;
        const initialMonthlyPayment = loan.initial_monthly_payment;
        const calculationDate = new Date();
    
        // 3. טען את כל התשלומים ושינויים
        const paymentEntities = await this.LoanActionService.getLoanPayments(loanId);
        const paymentEvents: PaymentEvent[] = paymentEntities.map((evt) => ({
          date: new Date(evt.date),
          amount: evt.value,
          action_type: evt.action_type,
        }));
    
        // 4. מיין כרונולוגית
        paymentEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    
        // 5. חשב כמה שולם בפועל עד התאריך המבוקש
        const totalActualPaid = paymentEvents
          .filter(
            (e) =>
              e.action_type === LoanPaymentActionType.PAYMENT &&
              e.date <= calculationDate,
          )
          .reduce((sum, e) => sum + e.amount, 0);
    
        // 6. חשב כמה היה אמור להיות משולם (expectedPaid)
        let totalExpected = 0;
        let currentRate = initialMonthlyPayment;
        let periodStart = loanStartDate;
    
        for (const evt of paymentEvents) {
          if (evt.date > calculationDate) break;
    
          if (evt.action_type === LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE) {
            // מספר החודשים השלמים בין periodStart לתאריך השינוי
            const monthsAtOldRate = differenceInMonths(evt.date, periodStart);
    
            totalExpected += monthsAtOldRate * currentRate;
    
            // עצירה מוקדמת אם גרענו את ה-principal
            if (totalExpected >= principal) {
              totalExpected = principal;
              break;
            }
    
            // עדכן לתעריף החדש
            currentRate = evt.amount;
            periodStart = evt.date;
          }
        }
    
        // 7. תקופה אחרונה (מאירוע הסופי או מההתחלה) עד calculationDate
        if (totalExpected < principal) {
          const monthsAfter = differenceInMonths(calculationDate, periodStart);
          totalExpected += monthsAfter * currentRate;
          totalExpected = Math.min(totalExpected, principal);
        }
    
        const netBalance = totalActualPaid - totalExpected;
        const pd = await this.paymentDetailsRepo.findOne({
          where: { user: { id: loan.user.id } },
        });
        if (!pd) throw new Error('Payment details not found for user');
    
        // בנה מערך חדש: סינון הישן + הוספת האובייקט המעודכן
        pd.loan_balances = [
          ...pd.loan_balances.filter((x) => x.loanId !== loan.id),
          { loanId: loan.id, balance: netBalance },
        ];
    await this.loanService.recordLoanBalance(loan.id, netBalance);
        // שמירה חזרה
        await this.paymentDetailsRepo.save(pd);
        return netBalance;
      }
}