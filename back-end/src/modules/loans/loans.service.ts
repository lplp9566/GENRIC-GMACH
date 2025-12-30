import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
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
import { FindOpts, LoanStatus, PaginatedResult } from '../../common/index';
import { EditLoanDto } from './loan-dto/editLoanDto';
import { LoanActionBalanceService } from './loan-actions/loan_action_balance.service';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanEntity)
    private loansRepository: Repository<LoanEntity>,
    @InjectRepository(LoanActionEntity)
    private paymentsRepository: Repository<LoanActionEntity>,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly usersService: UsersService,
    private readonly fundsOverviewByYearService: FundsOverviewByYearService,
    private readonly fundsFlowService: FundsFlowService,
      @Inject(forwardRef(() => LoanActionBalanceService))
          private readonly LoanActionBalanceService: LoanActionBalanceService,
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
 async getLoans(opts: FindOpts): Promise<PaginatedResult<LoanEntity>> {
  const page = opts.page > 0 ? opts.page : 1;
  const limit = opts.limit > 0 ? Math.min(opts.limit, 100) : 50;

  const todayDay = new Date().getDate(); // 1..31

  try {
   const qb = this.loansRepository
  .createQueryBuilder("loan")
  .leftJoinAndSelect("loan.user", "user");

if (opts.status === LoanStatus.ACTIVE) qb.andWhere("loan.isActive = :a", { a: true });
else if (opts.status === LoanStatus.INACTIVE) qb.andWhere("loan.isActive = :a", { a: false });

if (opts.userId) qb.andWhere("user.id = :uid", { uid: opts.userId });

qb.addOrderBy(`CASE WHEN loan.balance < 0 THEN 0 ELSE 1 END`, "ASC");
qb.addOrderBy(`CASE WHEN loan.balance < 0 THEN loan.balance ELSE 999999999 END`, "ASC");

qb.addOrderBy(
  `CASE
     WHEN loan.payment_date >= :todayDay THEN loan.payment_date - :todayDay
     ELSE loan.payment_date + 31 - :todayDay
   END`,
  "ASC",
);

qb.setParameter("todayDay", new Date().getDate());
    const [data, total] = await qb.getManyAndCount();
    const pageCount = Math.ceil(total / limit);

    return { data, total, page, pageCount };
  } catch (err: any) {
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
     const result = await this.loansRepository.save(loanRecord);
            await this.LoanActionBalanceService.computeLoanNetBalance(result.id);

      return result;
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
      const result = await this.paymentsRepository.save({
        loan,
        date: dto.date,
        value: diff,
        action_type: LoanPaymentActionType.AMOUNT_CHANGE,
        note: dto.note || `שינוי סכום הלוואה ל-${dto.value}`,
      })
      await this.LoanActionBalanceService.computeLoanNetBalance(dto.loanId);
      return result;
      }
    catch (error) {
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
      const result  =  await this.paymentsRepository.save({
        loan,
        date: dto.date,
        value: dto.value,
        action_type: LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE,
        // note: dto.note || `שינוי תשלום חודשי ל-${dto.value}`,

      });
        await this.LoanActionBalanceService.computeLoanNetBalance(result.id)
      return result;
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
      const result = await this.paymentsRepository.save({
        loan,
        date: dto.date,
        value: dto.value,
        action_type: LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE,
        // note: dto.note || `שינוי תאריך תשלום ל-${dto.value}`,
      })
      await this.LoanActionBalanceService.computeLoanNetBalance(result.id)
      return result;
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
 async editLoanSimple(loanId: number, dto: EditLoanDto) {
  console.log(dto);
  
    const toDate = (v: string | Date | undefined): Date | undefined => {
  if (!v) return undefined;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}; 
  const loan = await this.loansRepository.findOne({
    where: { id: loanId },
    relations: ['user'],
  });

  if (!loan) throw new BadRequestException('Loan not found');
  if (!loan.isActive) throw new BadRequestException('Loan not active');
  // שינוי סכום הלוואה
  if (dto.loan_amount !== undefined && dto.loan_amount !== loan.loan_amount) {
    const oldAmount = Number(loan.loan_amount);
    const newAmount = Number(dto.loan_amount);
    const diff = newAmount - oldAmount; 

    // אם מגדילים – חייבים כסף פנוי
    if (diff > 0) {
      const fund = await this.fundsOverviewService.getFundDetails();
      if (Number(fund.available_funds) < diff) {
        throw new BadRequestException(`אין מספיק כסף להגדלת ההלוואה ב־${diff} ₪`);
      }
    }

    // עדכון הלוואה
    loan.loan_amount = newAmount;
    loan.remaining_balance = Number(loan.remaining_balance) + diff;
  }

  // שינוי תשלום חודשי
  if (dto.monthly_payment !== undefined && dto.monthly_payment !== loan.monthly_payment) {    
    loan.initial_monthly_payment = Number(dto.monthly_payment);
    
  }

  // שינוי תאריך חיוב
  if (dto.payment_date !== undefined && dto.payment_date !== loan.payment_date) {
    loan.payment_date = dto.payment_date;
  }

  // חישובים סופיים
  loan.loan_date =  toDate(dto.loan_date) || loan.loan_date;
  loan.first_payment_date = toDate(dto.first_payment_date) || loan.first_payment_date;
  loan.purpose = dto.purpose !== undefined ? dto.purpose : loan.purpose;
  loan.guarantor1 = dto.guarantor1 !== undefined ? dto.guarantor1 : loan.guarantor1;
  loan.guarantor2 = dto.guarantor2 !== undefined ? dto.guarantor2 : loan.guarantor2;
  loan.total_installments =
    Number(loan.monthly_payment) > 0
      ? Number(loan.remaining_balance) / Number(loan.monthly_payment)
      : loan.total_installments;
  // אם balance אצלך אמור להיות היתרה הנוכחית
  const result = await this.loansRepository.save(loan);
   if (result) await this.LoanActionBalanceService.computeLoanNetBalance(loan.id);

  return result;
}

}
