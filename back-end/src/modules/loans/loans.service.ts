import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanEntity } from './loans.entity';
import { LoanPaymentEntity } from './loan-actions/loan_actions.entity';
import { UserFinancialByYearService } from '../users/user-financials-by-year/user-financial-by-year.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { FundsOverviewEntity } from '../funds-overview/entity/funds-overview.entity';
import { UsersService } from '../users/users.service';
import { getYearFromDate } from '../../services/services';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { LoanActionDto, LoanPaymentActionType } from './loan-dto/loanTypes';
// cSpell:ignore Financials


@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanEntity)
    private loansRepository: Repository<LoanEntity>,
    @InjectRepository(LoanPaymentEntity)
    private paymentsRepository: Repository<LoanPaymentEntity>,
    private readonly userFinancialsService: UserFinancialsService,
    private readonly userFinancialsByYearService: UserFinancialByYearService,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly usersService: UsersService,
  ) {}
  async getLoans(): Promise<LoanEntity[]> {
    try {
      return this.loansRepository.find({ relations: ['user', ] });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async createLoan(loanData: Partial<LoanEntity>) {
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
      loanRecord.initialMonthlyPayment= loanData.monthly_payment!;
      this.loansRepository.save(loanRecord);
      const tt =    await this.userFinancialsService.recordLoanTaken(
        user,
        loanRecord.loan_amount,
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

  async getAllPements(): Promise<LoanPaymentEntity[]> {
    try {
      return this.paymentsRepository.find({ relations: ['loan'] });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async changeLoanAmount(dto: LoanActionDto): Promise<LoanPaymentEntity> {
    const loan = await this.loansRepository.findOne({
      where: { id: dto.loanId },
      relations: ['user'],      
    });    if (!loan) throw new Error('Loan not found');
    if (!loan.isActive) {
      throw new BadRequestException('Cannot operate on a closed loan');
    }
  try {
    const diff = dto.amount - loan.loan_amount;
    loan.loan_amount = dto.amount;
    loan.remaining_balance += diff;
    loan.total_installments = Math.ceil(
      loan.remaining_balance / loan.monthly_payment
    );
    await this.loansRepository.save(loan);
    const year = getYearFromDate(dto.date);
    await Promise.all([
      this.userFinancialsByYearService.recordLoanTaken(loan.user,year, diff),
      this.userFinancialsService.recordLoanTaken(loan.user, diff),
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
      if (!loan.isActive) {
        throw new BadRequestException('Cannot operate on a closed loan');
      }
      loan.monthly_payment = dto.amount;
      loan.total_installments = Math.ceil(
        loan.remaining_balance / loan.monthly_payment
      );
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
    if (!loan.isActive) {
      throw new BadRequestException('Cannot operate on a closed loan');
    }
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
      note: dto.note || `שינוי תאריך תשלום ל-${dto.amount}`,
    });
  } catch (error) {
    console.error('❌ Error in editDateOfPyment:', error.message);
    throw new Error(error.message);
  }
}

 }
