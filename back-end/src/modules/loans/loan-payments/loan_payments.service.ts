import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LoanEntity } from "../loans.entity";
import { Repository } from "typeorm";
import { LoanPaymentEntity } from "./loan_payments.entity";
import { UserFinancialsService } from "src/modules/users/user-financials/user-financials.service";
import { UserFinancialByYearService } from "src/modules/users/user-financials-by-year/user-financial-by-year.service";
import { FundsOverviewService } from "src/modules/funds-overview/funds-overview.service";
import { UsersService } from "src/modules/users/users.service";
import { LoanActionDto, LoanPaymentActionType, PaymentEvent } from "src/types/loanTypes";
import { getYearFromDate } from "src/services/services";
import { LoansService } from "../loans.service";
import { differenceInMonths } from 'date-fns';
import { PaymentDetailsEntity } from "src/modules/users/payment-details/payment_details.entity";


 
@Injectable()
export class LoanPaymentsService {
  constructor(
    @InjectRepository(LoanEntity)
    private readonly loansRepo: Repository<LoanEntity>,
    @InjectRepository(LoanPaymentEntity)
    private readonly paymentsRepo: Repository<LoanPaymentEntity>,
    @InjectRepository(PaymentDetailsEntity)
    private readonly paymentDetailsRepo: Repository<PaymentDetailsEntity>,
    private readonly loansService: LoansService,                  // צריך להיות LoansService
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
        // relations: ['user'],
      });
  
      if (!loan) {
        throw new Error('Loan not found');
      }
  
      const newPayment = this.paymentsRepo.create({
        loan: loan,
        date: dto.date,       
        amount: dto.amount,
        action_type: LoanPaymentActionType.PAYMENT,
      });
 
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
      throw new Error(error.message);
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
    const loan = await this.loansRepo.findOne({ where: { id: loanId } });
    if (!loan) throw new Error('Loan not found');
  
    const loanStartDate = new Date(loan.loan_date);
    const principal = loan.loan_amount;
    const initialMonthlyPayment = loan.monthly_payment;
    const calculationDate = new Date();
  
    // טען את כל התשלומים
    const paymentEntities = await this.getLoanPayments(loanId);
    const paymentEvents = paymentEntities.map(evt => ({
      date: new Date(evt.date),
      amount: evt.amount,
      action_type: evt.action_type,
    }));
  
    // ממיין
    const sortedEvents = paymentEvents.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  
    // 1. כמה שולם בפועל
    const totalActualPaid = sortedEvents
      .filter(e =>
        e.action_type === LoanPaymentActionType.PAYMENT &&
        e.date <= calculationDate
      )
      .reduce((sum, e) => sum + e.amount, 0);
  
    // 2. כמה היה צריך לשלם עד היום
    let totalExpectedToBePaid = 0;
    let currentMonthlyAmount = initialMonthlyPayment;
    let periodStartDate = loanStartDate;
  
    for (const e of sortedEvents) {
      if (e.date > calculationDate) break;
  
      if (e.action_type === LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE) {
        const monthsBetween = differenceInMonths(e.date, periodStartDate);
        totalExpectedToBePaid += monthsBetween * currentMonthlyAmount;
  
        // נעצור מוקדם אם כבר הגענו ל־principal
        if (totalExpectedToBePaid >= principal) {
          totalExpectedToBePaid = principal;
          break;
        }
  
        currentMonthlyAmount = e.amount;
        periodStartDate = e.date;
      }
    }
  
    // תקופה מ־event האחרון או מתחילת ההלוואה
    if (totalExpectedToBePaid < principal) {
      const tailMonths = differenceInMonths(calculationDate, periodStartDate);
      totalExpectedToBePaid += tailMonths * currentMonthlyAmount;
    }
  
    // הגבלה סופית
    totalExpectedToBePaid = Math.min(totalExpectedToBePaid, principal);
  
    // 3. net balance
    //    חיובי => שילם יותר ממה שהיה צריך (בפלוס)
    //    שלילי => שילם פחות (בחוב)
    console.log(totalActualPaid - totalExpectedToBePaid)
    return totalActualPaid - totalExpectedToBePaid;
  }
}