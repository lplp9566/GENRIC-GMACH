import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanEntity } from './loans.entity';
import { LoanPaymentEntity } from './loan-payments/loan_payments.entity';
import { LoanActionDto, LoanPaymentActionType } from 'src/types/loanTypes';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { FundsOverviewEntity } from '../funds-overview/entity/funds-overview.entity';
import { UsersService } from '../users/users.service';
import { getYearFromDate } from '../../services/services';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanEntity)
    private loansRepository: Repository<LoanEntity>,
    @InjectRepository(LoanPaymentEntity)
    private paymentsRepository: Repository<LoanPaymentEntity>,
    private readonly userFinacialsService: UserFinancialsService,
    private readonly userFinancialsByYearService: UserFinancialByYearService,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly usersService: UsersService,
  ) {}

  async createLoan(loanData: Partial<LoanEntity>): Promise<LoanEntity> {
    try {
      await this.fundsOverviewService.addLoan(loanData.loan_amount!);
      const loanRecord = this.loansRepository.create(loanData);
      loanRecord.remaining_balance = loanRecord.loan_amount;
      loanRecord.total_installments = loanRecord.loan_amount / loanRecord.monthly_payment;
      const year = getYearFromDate(loanRecord.loan_date);
      const user = await this.usersService.getUserById(Number(loanRecord.user));
      if (!user) {
        throw new Error('User not found');
      }
        await this.userFinancialsByYearService.recordLoanTaken(
        user,
        year,
        loanRecord.loan_amount,
      );
      loanRecord.initialMonthlyPayment= loanData.monthly_payment!;
      await this.userFinacialsService.recordLoanTaken(
        user,
        loanRecord.loan_amount,
      );
      
      return this.loansRepository.save(loanRecord);
    } catch (error) {
      return error.message;
    }
  }


 
  async getLoanById(id: number): Promise<LoanEntity | null> {
    try {
      return this.loansRepository.findOne({
        where: { id },
        relations: ['payments'],
      });
    } catch (error) {
      return error.message;
    }
  }

  async getAllPements(): Promise<LoanPaymentEntity[]> {
    try {
      return this.paymentsRepository.find({ relations: ['loan'] });
    } catch (error) {
      return error.message;
    }
  }
  async changeLoanAmount(dto: LoanActionDto): Promise<LoanPaymentEntity> {
    const loan = await this.loansRepository.findOne({ where: { id: dto.loanId } });
    if (!loan) throw new Error('Loan not found');
  try {
    const diff = dto.amount - loan.loan_amount;
    loan.loan_amount = dto.amount;
    loan.remaining_balance += diff;
    loan.total_installments= loan.remaining_balance / loan.monthly_payment;
    await this.loansRepository.save(loan);
  

    const year = getYearFromDate(dto.date);
    await Promise.all([
      this.userFinancialsByYearService.recordLoanTaken(loan.user,year, diff),
      this.userFinacialsService.recordLoanTaken(loan.user, diff),
      this.fundsOverviewService.addLoan(diff),
    ]);
  return  await this.paymentsRepository.save({
      loan,
      date: dto.date,
      amount: diff,
      action_type: LoanPaymentActionType.AMOUNT_CHANGE,
      note: dto.note || `שינוי סכום הלוואה ל-${dto.amount}`
    });
  } catch (error) {
    console.error('❌ Error in editLoin:', error.message);
    throw new Error(error.message);
  }
   
  }
  async changeMonthlyPayment(dto:LoanActionDto) {
    try {
      const loan = await this.loansRepository.findOne({ where: { id: dto.loanId } });
      if (!loan) throw new Error('Loan not found');
      loan.monthly_payment = dto.amount;
      loan.total_installments = loan.remaining_balance / loan.monthly_payment;
      await this.loansRepository.save(loan);
      return await this.paymentsRepository.save({
        loan,
        date: dto.date,
        amount: dto.amount,
        action_type: LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE,
        note: dto.note || `שינוי תשלום חודשי ל-${dto.amount}`,
      });
    } catch (error) {
      console.error('❌ Error in editmontlyPayment:', error.message);
    throw new Error(error.message);
    }
 }
 async changeDateOfPayment(dto:LoanActionDto) {
  try {
    const loan = await this.loansRepository.findOne({ where: { id: dto.loanId } });
    if (!loan) throw new Error('Loan not found');
    if(dto.amount > 31 || dto.amount < 0) {
      throw new Error('Invalid payment date');
    }
    loan.payment_date = dto.amount;
    await this.loansRepository.save(loan);
    return await this.paymentsRepository.save({
      loan,
      date: dto.date,
      amount: dto.amount,
      action_type: LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE,
      note: dto.note || `שינוי תאריך תשלום ל-${dto.date}`,
    });
  } catch (error) {
    console.error('❌ Error in editDateOfPyment:', error.message);
    throw new Error(error.message);
  }
}

 }
