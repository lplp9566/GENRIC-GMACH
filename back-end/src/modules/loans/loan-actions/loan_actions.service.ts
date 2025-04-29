import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LoanEntity } from "../loans.entity";
import { Repository } from "typeorm";
import { LoanPaymentEntity } from "./loan_actions.entity";
import { UserFinancialsService } from "src/modules/users/user-financials/user-financials.service";
import { UserFinancialByYearService } from "src/modules/users/user-financials-by-year/user-financial-by-year.service";
import { FundsOverviewService } from "src/modules/funds-overview/funds-overview.service";
import { UsersService } from "src/modules/users/users.service";
import { getYearFromDate } from "src/services/services";
import { LoansService } from "../loans.service";
import { differenceInCalendarMonths, differenceInMonths } from 'date-fns';
import { PaymentDetailsEntity } from "src/modules/users/payment-details/payment_details.entity";
import { LoanActionDto, LoanPaymentActionType, PaymentEvent } from "../loan-dto/loanTypes";

// cSpell:ignore Financials

 
@Injectable()
export class LoanActionsService {
  constructor(
    @InjectRepository(LoanEntity)
    private readonly loansRepo: Repository<LoanEntity>,
    @InjectRepository(LoanPaymentEntity)
    private readonly paymentsRepo: Repository<LoanPaymentEntity>,
    @InjectRepository(PaymentDetailsEntity)
    private readonly paymentDetailsRepo: Repository<PaymentDetailsEntity>,
    private readonly loansService: LoansService,              
    private readonly userFinByYear: UserFinancialByYearService,
    private readonly userFin: UserFinancialsService,
    private readonly fundsOverview: FundsOverviewService,
    private readonly usersService: UsersService,
  ) {}
   async handleLoanAction(dto:LoanActionDto ): Promise<LoanPaymentEntity> {
    switch (dto.action_type) {
      case LoanPaymentActionType.PAYMENT:
        return this.addLoanPayment(dto);
  
      case LoanPaymentActionType.AMOUNT_CHANGE:
        return this.loansService.changeLoanAmount(dto);
  
      case LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE:
        return this.loansService.changeMonthlyPayment(dto);
  
      case LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE:
        return this.loansService.changeDateOfPayment(dto);
  
      default:
        throw new Error(`Unknown action type: ${dto.action_type}`);
    }
  }
  
 async addLoanPayment(dto:LoanActionDto): Promise<LoanPaymentEntity> {
    try {
      const loan = await this.loansRepo.findOne({
        where: { id:dto.loanId  },
        relations: ['user'],
      });
  
      if (!loan) {
        throw new Error('Loan not found');
      }
      if (!loan.isActive) {
        throw new BadRequestException('Cannot operate on a closed loan');
      }
      const newPayment = this.paymentsRepo.create({
        loan: loan,
        date: dto.date,       
        amount: dto.amount,
        action_type: LoanPaymentActionType.PAYMENT,
      });
      if (loan.remaining_balance === 0) {
        loan.isActive = false;
      }
      await this.loansRepo.save(loan);
    
      await this.paymentsRepo.save(newPayment);
  
      loan.remaining_balance -= dto.amount;
      if (loan.remaining_balance < 0) loan.remaining_balance = 0;
      loan.total_installments = loan.remaining_balance / loan.monthly_payment;
  
      await this.loansRepo.save(loan);
  
      const year = getYearFromDate(dto.date);
  
      await Promise.all([
        this.userFinByYear.recordLoanRepaid(loan.user, year, dto.amount),
        this.userFin.recordLoanRepaid(loan.user, dto.amount),
        this.fundsOverview.repayLoan(dto.amount),
      ]);
      await this.computeLoanNetBalance(loan.id);
  
      return newPayment;
  
    } catch (error) {
      console.error('❌ Error in addPayment:', error.message);
      throw new BadRequestException(error.message);
    }
  }
  async getLoanPayments(loanId: number){
    try {
      const loan = await this.loansRepo.findOne({
        where: { id:loanId  },
        // relations: ['user'],
      });
      if (!loan) {
        throw new Error('Loan not found');
      }
      const payments = await this.paymentsRepo.find({
        where: { loan: loan },
        order: { date: 'ASC' },
      });
      return payments;
  
    } catch (error) {
      console.error('❌ Error in getLoanPayments:', error.message);
      throw new Error(error.message);
    }
  }
  async computeLoanNetBalance(loanId: number): Promise<number> {
    // 1. טען את ההלוואה כולל המשתמש
    const loan = await this.loansRepo.findOne({
      where: { id: loanId },
      relations: ['user'],
    });
    if (!loan) throw new Error('Loan not found');
  
    // 2. הגדרות בסיס
    const loanStartDate = new Date(loan.loan_date);
    const principal = loan.loan_amount;
    const initialMonthlyPayment = loan.initialMonthlyPayment;
    const calculationDate = new Date();
  
    // 3. טען את כל התשלומים ושינויים
    const paymentEntities = await this.getLoanPayments(loanId);
    const paymentEvents: PaymentEvent[] = paymentEntities.map(evt => ({
      date: new Date(evt.date),
      amount: evt.amount,
      action_type: evt.action_type,
    }));
  
    // 4. מיין כרונולוגית
    paymentEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  
    // 5. חשב כמה שולם בפועל עד התאריך המבוקש
    const totalActualPaid = paymentEvents
      .filter(e => e.action_type === LoanPaymentActionType.PAYMENT && e.date <= calculationDate)
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
  
 

    const netBalance  = totalActualPaid - totalExpected
    const pd = await this.paymentDetailsRepo.findOne({
      where: { user: { id: loan.user.id } },
    });
    if (!pd) throw new Error('Payment details not found for user');
  
    // בנה מערך חדש: סינון הישן + הוספת האובייקט המעודכן
    pd.loan_balances = [
      ...pd.loan_balances.filter(x => x.loanId !== loan.id),
      { loanId: loan.id, balance: netBalance },
    ];
  
    // שמירה חזרה
    await this.paymentDetailsRepo.save(pd);
    return netBalance ;

  }

}