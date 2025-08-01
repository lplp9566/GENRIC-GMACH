import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanActionEntity } from './loan-actions/Entity/loan_actions.entity';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { UsersService } from '../users/users.service';
import { getYearFromDate } from '../../services/services';
import { UserFinancialService } from '../users/user-financials/user-financials.service';
import { LoanActionDto, LoanPaymentActionType } from './loan-dto/loanTypes';
import { FundsOverviewByYearService } from '../funds-overview-by-year/funds-overview-by-year.service';
import { FundsFlowService } from './calcelete.service';
import { LoanEntity } from './Entity/loans.entity';
import { FindLoansOpts, LoanStatus, PaginatedResult } from '../../common/index';
import { log } from 'console';
import { b } from 'vite/dist/node/moduleRunnerTransport.d-CXw_Ws6P';
import { FundsOverviewEntity } from '../funds-overview/entity/funds-overview.entity';
import { PaymentDetailsService } from '../users/payment-details/payment-details.service';
// cSpell:ignore Financials

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanEntity)
    private loansRepository: Repository<LoanEntity>,
    @InjectRepository(LoanActionEntity)
    private paymentsRepository: Repository<LoanActionEntity>,
    private readonly userFinancialsService: UserFinancialService,
    private readonly userFinancialsByYearService: UserFinancialByYearService,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly usersService: UsersService,
    private readonly fundsOverviewByYearService: FundsOverviewByYearService,
    private readonly fundsFlowService: FundsFlowService,
  ) {}

  async checkLoan(
    loanData: Partial<LoanEntity>,
  ): Promise<{ ok: boolean; error: string; butten: boolean }> {
    try {
      const fund_details = await this.fundsOverviewService.getFundDetails();
      if (fund_details.available_funds < loanData.loan_amount!) {
        return {
          butten: false,
          ok: false,
          error:
            'לא ניתן להוציא הלוואה על ' +
            loanData.loan_amount! +
            ' ש"ח, במערכת יש כרגע ' +
            fund_details.available_funds +
            ' ש"ח',
        };
      }
      const activeLoans = await this.loansRepository.find({
        where: { user: { id: loanData.user?.id }, isActive: true },
      });
      for (const loan of activeLoans) {
        if (loan.purpose === loanData.purpose) {
          return {
            ok: false,
            error: `משתמש זה כבר לקח הלוואה למטרה זו, לא ניתן להוציא הלוואה נוספת`,
            butten: false,
          };
        }
      }
      const fromDate = new Date(loanData.loan_date!);
      const success = await this.fundsFlowService.getCashFlowTotals(
        fromDate,
        loanData,
      );

      if (!success) {
        return { ok: false, error: 'לא מספיק כסף במערכת', butten: false };
      }
      return { ok: true, error: '', butten: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // console.log(message)
      return { ok: false, error: message, butten: true };
    }
  }
  async getLoans(opts: FindLoansOpts): Promise<PaginatedResult<LoanEntity>> {
    const page = opts.page > 0 ? opts.page : 1;
    const limit = opts.limit > 0 ? Math.min(opts.limit, 100) : 50;

    // בניית ה־where הדינמי
    const where: any = {};

    // סינון לפי סטטוס
    if (opts.status === LoanStatus.ACTIVE) {
      where.isActive = true;
    } else if (opts.status === LoanStatus.INACTIVE) {
      where.isActive = false;
    }

    if (opts.userId) {
      where.user = { id: opts.userId };
    }

    try {
      const [data, total] = await this.loansRepository.findAndCount({
        where,
        relations: ['user'],
        skip: (page - 1) * limit,
        take: limit,
        order: { loan_date: 'DESC' },
      });

      const pageCount = Math.ceil(total / limit);
      return { data, total, page, pageCount };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async createLoan(loanData: Partial<LoanEntity>) {
    try {
      const fund_details = await this.fundsOverviewService.getFundDetails();
      if (fund_details.available_funds < loanData?.loan_amount!) {
        throw new BadRequestException(
          'אתה לא יכול להוציא הלוואה על  ' +
            loanData.loan_amount +
            ' ש"ח, במערכת יש כרגע ' +
            fund_details.available_funds +
            ' ש"ח',
        );
      }
      const loanRecord = this.loansRepository.create(loanData);
      loanRecord.remaining_balance = loanRecord.loan_amount;
      loanRecord.total_installments =
        loanRecord.loan_amount / loanRecord.monthly_payment;
      const year = getYearFromDate(loanRecord.loan_date);
      const user = await this.usersService.getUserById(Number(loanRecord.user));
      if (!user) {
        throw new Error('User not found');
      }
      loanRecord.initial_monthly_payment = loanData.monthly_payment!;
      loanRecord.initial_loan_amount = loanData.loan_amount!;
      loanRecord.total_remaining_payments = 0;
      if (loanData.guarantor1) {
        loanRecord.guarantor1 = loanData.guarantor1;
      }
      if (loanData.guarantor2) {
        loanRecord.guarantor2 = loanData.guarantor2;
      }
      this.loansRepository.save(loanRecord);
      await this.userFinancialsService.recordLoanTaken(
        user,
        loanRecord.loan_amount,
      );
      await this.fundsOverviewService.addLoan(loanData.loan_amount!);
      await this.fundsOverviewByYearService.recordLoanTaken(
        year,
        loanData.loan_amount!,
      );
      await this.userFinancialsByYearService.recordLoanTaken(
        user,
        year,
        loanRecord.loan_amount,
      );
      return loanRecord;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getLoanById(id: number): Promise<LoanEntity | null> {
    try {
      return this.loansRepository.findOne({
        where: { id },
        relations: ['actions'],
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAllActions(): Promise<LoanActionEntity[]> {
    try {
      return this.paymentsRepository.find({ relations: ['loan'] });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async changeLoanAmount(dto: LoanActionDto): Promise<LoanActionEntity> {
    try {
      const loan = await this.loansRepository.findOne({
        where: { id: dto.loanId },
        relations: ['user'],
      });
      if (!loan) throw new Error('Loan not found');
      if (!loan.isActive) {
        throw new Error('Cannot operate on a closed loan');
      }
      const diff = dto.value;
      loan.loan_amount += dto.value;
      loan.remaining_balance += dto.value;
      (loan.total_installments = loan.remaining_balance / loan.monthly_payment),
        await this.loansRepository.save(loan);
      const year = getYearFromDate(dto.date);
      await Promise.all([
        this.userFinancialsByYearService.recordLoanTaken(loan.user, year, diff),
        this.userFinancialsService.recordLoanTaken(loan.user, diff),
        this.fundsOverviewService.addLoan(diff),
        this.fundsOverviewByYearService.recordAddToLoan(year, diff),
      ]);
      return await this.paymentsRepository.save({
        loan,
        date: dto.date,
        value: diff,
        action_type: LoanPaymentActionType.AMOUNT_CHANGE,
        // note: dto.note || `שינוי סכום הלוואה ל-${dto.amount}`,
      });
    } catch (error) {
      console.error('❌ Error in editLoin:', error.message);
      throw new Error(error.message);
    }
  }
  async changeMonthlyPayment(dto: LoanActionDto) {
    const loan = await this.loansRepository.findOne({
      where: { id: dto.loanId },
    });
    if (!loan) throw new BadRequestException('Loan not found');
    if (!loan.isActive) {
      throw new BadRequestException('Cannot operate on a closed loan');
    }
    try {
      loan.monthly_payment = dto.value;
      (loan.total_installments = loan.remaining_balance / loan.monthly_payment),
        await this.loansRepository.save(loan);
      return await this.paymentsRepository.save({
        loan,
        date: dto.date,
        value: dto.value,
        action_type: LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE,
        // note: dto.note || `שינוי תשלום חודשי ל-${dto.value}`,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async changeDateOfPayment(dto: LoanActionDto) {
    try {
      const loan = await this.loansRepository.findOne({
        where: { id: dto.loanId },
      });
      if (!loan) throw new BadRequestException('Loan not found');
      if (!loan.isActive) {
        throw new BadRequestException('Cannot operate on a closed loan');
      }
      if (dto.value > 31 || dto.value < 0) {
        throw new Error('Invalid payment date');
      }
      loan.payment_date = dto.value;
      await this.loansRepository.save(loan);
      return await this.paymentsRepository.save({
        loan,
        date: dto.date,
        value: dto.value,
        action_type: LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE,
        // note: dto.note || `שינוי תאריך תשלום ל-${dto.value}`,
      });
    } catch (error) {
      console.error('❌ Error in editDateOfPyment:', error.message);
      throw new Error(error.message);
    }
  }
  async recordLoanBalance(loanId: number, balance: number) {
    try {
      const loan = await this.loansRepository.findOne({
        where: { id: loanId },
      });
      if (!loan) throw new BadRequestException('Loan not found');
      loan.balance = balance;
      await this.loansRepository.save(loan);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
