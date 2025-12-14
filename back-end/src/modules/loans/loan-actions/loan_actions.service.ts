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
    private readonly fundsOverview: FundsOverviewService,
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
        this.userFinByYear.recordLoanRepaid(loan.user, year, dto.value),
        this.userFin.recordLoanRepaid(loan.user, dto.value),
        this.fundsOverview.repayLoan(dto.value),
        this.fundsOverviewByYearService.recordLoanRepaid(year, dto.value),
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
}
