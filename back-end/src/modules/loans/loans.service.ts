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
import { FindLoansOpts, LoanStatus, PaginatedResult } from 'src/common';
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
    private readonly fundsFlowService:FundsFlowService
  ) {}
 
  async checkLoan(
    loanData: Partial<LoanEntity>
  ): Promise<{ ok: boolean; error: string }> {
    try {
      const fromDate = new Date(loanData.loan_date!);
      const success = await this.fundsFlowService.getCashFlowTotals(
        fromDate,
        loanData
      );
      // אם הפונקציה מחזירה false, נתייחס לזה כשגיאה
      if (!success) {
        return { ok: false, error: 'לא מספיק כסף במערכת' };
      }
      return { ok: true , error: '' };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // console.log(message)
      return { ok: false, error: message };
    }
  }
async getLoans(opts: FindLoansOpts): Promise<PaginatedResult<LoanEntity>> {
  const page  = opts.page  > 0 ? opts.page  : 1;
  const limit = opts.limit > 0 ? Math.min(opts.limit, 100) : 50;

  // בניית ה־where הדינמי
  const where: any = {};

  // סינון לפי סטטוס
  if (opts.status === LoanStatus.ACTIVE) {
    where.isActive = true;
  } else if (opts.status === LoanStatus.INACTIVE) {
    where.isActive = false;

  } 

  // (אם צריך) סינון לפי משתמש
  // if (opts.userId !== undefined) {
  //   where.user = { id: opts.userId };
  // }

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
    if(fund_details.available_funds<loanData?.loan_amount!){
      throw new BadRequestException('אין מספיק כסף במערכת להוציא הלוואה על סכום זה');
    }
      const loanRecord = this.loansRepository.create(loanData);
      loanRecord.remaining_balance = loanRecord.loan_amount;
      loanRecord.total_installments = loanRecord.loan_amount / loanRecord.monthly_payment;
      const year = getYearFromDate(loanRecord.loan_date);
      const user = await this.usersService.getUserById(Number(loanRecord.user));
      if (!user) {
        throw new Error('User not found');
      }
      loanRecord.initialMonthlyPayment = loanData.monthly_payment!;
      this.loansRepository.save(loanRecord);
      const tt = await this.userFinancialsService.recordLoanTaken(
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
        relations: ['payments'],
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
      const demoLoan = {...loan}
      demoLoan.loan_amount = dto.value + loan.remaining_balance
      const diff = dto.value - loan.loan_amount;
      loan.loan_amount = dto.value;
      const success =  await this.fundsFlowService.getCashFlowTotals(dto.date, demoLoan);
      if(!success) throw new Error('you need the mony for the deposit');
      loan.remaining_balance += diff;
      loan.total_installments = Math.ceil(
        loan.remaining_balance / loan.monthly_payment,
      );
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
      loan.total_installments = Math.ceil(
        loan.remaining_balance / loan.monthly_payment,
      );
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
}
