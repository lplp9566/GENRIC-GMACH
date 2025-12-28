import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoanEntity } from '../Entity/loans.entity';
import { Repository } from 'typeorm';
import { LoanActionEntity } from './Entity/loan_actions.entity';
import { FundsOverviewService } from '../../funds-overview/funds-overview.service';
import { getYearFromDate } from '../../../services/services';
import { LoansService } from '../loans.service';
import {
  LoanActionDto,
  LoanPaymentActionType,
  PaymentEvent,
} from '../loan-dto/loanTypes';
import { PaymentDetailsEntity } from '../../users/payment-details/payment_details.entity';
import { UserFinancialByYearService } from '../../users/user-financials-by-year/user-financial-by-year.service';
import { UserFinancialService } from '../../users/user-financials/user-financials.service';
import { UsersService } from '../../users/users.service';
import { FundsOverviewByYearService } from '../../funds-overview-by-year/funds-overview-by-year.service';
import { LoanActionBalanceService } from './loan_action_balance.service';
import { PaymentDetailsService } from '../../users/payment-details/payment-details.service';

// cSpell:ignore Financials

@Injectable()
export class LoanActionsService {
  constructor(
    @InjectRepository(LoanEntity)
    private readonly loansRepo: Repository<LoanEntity>,
    @InjectRepository(LoanActionEntity)
    private readonly paymentsRepo: Repository<LoanActionEntity>,
    @Inject(forwardRef(() => LoansService))
    private readonly loansService: LoansService,
    private readonly userFinByYear: UserFinancialByYearService,
    private readonly userFin: UserFinancialService,
    // private readonly fundsOverview: FundsOverviewService,
    private readonly usersService: UsersService,
    private readonly fundsOverviewByYearService: FundsOverviewByYearService,
    private readonly paymentDetailsService: PaymentDetailsService,

    @Inject(forwardRef(() => LoanActionBalanceService))
    private readonly LoanActionBalanceService: LoanActionBalanceService,
  ) {}
  async handleLoanAction(dto: LoanActionDto): Promise<LoanActionEntity> {
    try {
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
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async addLoanPayment(dto: LoanActionDto): Promise<LoanActionEntity> {
    try {
      const loan = await this.loansRepo.findOne({
        where: { id: dto.loanId },
        relations: ['user'],
      });

      if (!loan) {
        throw new Error('Loan not found');
      }
      if (!loan.isActive) {
        throw new BadRequestException('Cannot operate on a closed loan');
      }
      if (dto.value > loan.remaining_balance) {
        throw new BadRequestException('Payment exceeds remaining balance');
      }
      const newPayment = this.paymentsRepo.create({
        loan: loan,
        date: dto.date,
        value: dto.value,
        action_type: LoanPaymentActionType.PAYMENT,
      });

      await this.loansRepo.save(loan);

      await this.paymentsRepo.save(newPayment);

      loan.remaining_balance -= dto.value;
      loan.total_remaining_payments += 1;
      if (loan.remaining_balance < 0) loan.remaining_balance = 0;

      loan.total_installments = loan.remaining_balance / loan.monthly_payment;
      if (loan.remaining_balance === 0) {
        loan.isActive = false;
        await this.paymentDetailsService.deleteLoanBalance(
          loan.id,
          loan.user.id,
        );
      }
      await this.loansRepo.save(loan);

      const year = getYearFromDate(dto.date);
      await Promise.all([
        // this.userFinByYear.recordLoanRepaid(loan.user, year, dto.value),
        // this.userFin.recordLoanRepaid(loan.user, dto.value),
        // this.fundsOverview.repayLoan(dto.value),
        // this.fundsOverviewByYearService.recordLoanRepaid(year, dto.value),
      ]);
      await this.LoanActionBalanceService.computeLoanNetBalance(loan.id);

      return newPayment;
    } catch (error) {
      console.error('❌ Error in addPayment:', error.message);
      throw new BadRequestException(error.message);
    }
  }
  async getLoanPayments(loanId: number) {
    try {
      const loan = await this.loansRepo.findOne({
        where: { id: loanId },
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
  async getAllActions(): Promise<LoanActionEntity[]> {
    try {
      const actions = await this.paymentsRepo.find({
        order: { date: 'ASC' },
        relations: ['loan', 'loan.user'],
      });
      return actions;
    } catch (error) {
      console.error('❌ Error in getAllActions:', error.message);
      throw new Error(error.message);
    }
  }
  async editPayment(
  actionId: number,
  payload: { date?: Date; value?: number },
): Promise<LoanActionEntity> {
  try {
    const action = await this.paymentsRepo.findOne({
      where: { id: actionId },
      relations: ['loan', 'loan.user'],
    });
    if (!action) throw new BadRequestException('Payment action not found');

    if (action.action_type !== LoanPaymentActionType.PAYMENT) {
      throw new BadRequestException('Only PAYMENT actions can be edited');
    }

    const loan = action.loan;

    const oldValue = Number(action.value);
    const newValue =
      payload.value !== undefined ? Number(payload.value) : oldValue;

    if (newValue <= 0) throw new BadRequestException('Payment must be > 0');

    // delta: כמה "שינינו" את התשלום
    const delta = newValue - oldValue;

    // יתרה חדשה = יתרה נוכחית - delta
    const newRemaining = Number(loan.remaining_balance) - delta;
    if (newRemaining < 0) {
      throw new BadRequestException('Edited payment exceeds remaining balance');
    }

    // עדכון פעולה
    if (payload.date) action.date = payload.date;
    action.value = newValue;

    await this.paymentsRepo.save(action);

    // עדכון הלוואה
    loan.remaining_balance = newRemaining;

    // סגירה/פתיחה בהתאם ליתרה
    if (loan.remaining_balance === 0) {
      loan.isActive = false;
      await this.paymentDetailsService.deleteLoanBalance(loan.id, loan.user.id);
    } else {
      loan.isActive = true;
    }

    loan.total_installments =
      loan.monthly_payment > 0
        ? loan.remaining_balance / loan.monthly_payment
        : 0;

    await this.loansRepo.save(loan);
    await this.LoanActionBalanceService.computeLoanNetBalance(loan.id);    
    return action;
  } catch (error) {
    console.error('❌ Error in editPayment:', error.message);
    throw new BadRequestException(error.message);
  }
}
async deletePayment(actionId: number): Promise<{ deleted: true }> {
  try {
    const action = await this.paymentsRepo.findOne({
      where: { id: actionId },
      relations: ['loan', 'loan.user'],
    });
    if (!action) throw new BadRequestException('Payment action not found');

    if (action.action_type !== LoanPaymentActionType.PAYMENT) {
      throw new BadRequestException('Only PAYMENT actions can be deleted');
    }

    const loan = action.loan;

    const value = Number(action.value);

    // מחיקה של תשלום = להחזיר את הכסף ליתרה (להגדיל remaining_balance)
    loan.remaining_balance = Number(loan.remaining_balance) + value;

    // אם ההלוואה הייתה סגורה בגלל 0 יתרה — עכשיו היא נפתחת מחדש
    if (loan.remaining_balance > 0) {
      loan.isActive = true;
      // אם יש לך לוגיקה שמחזירה balance ב-paymentDetails, כאן המקום לקרוא לה.
      // כרגע אצלך ראיתי רק deleteLoanBalance.
    }

    loan.total_installments =
      loan.monthly_payment > 0
        ? loan.remaining_balance / loan.monthly_payment
        : 0;

    await this.loansRepo.save(loan);
    await this.paymentsRepo.remove(action);

    await this.LoanActionBalanceService.computeLoanNetBalance(loan.id);

    return { deleted: true };
  } catch (error) {
    console.error('❌ Error in deletePayment:', error.message);
    throw new BadRequestException(error.message);
  }
}


}
