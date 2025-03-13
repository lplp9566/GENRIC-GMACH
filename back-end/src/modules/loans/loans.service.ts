import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanEntity } from './loans.entity';
import { LoanPaymentEntity } from './loan-payments/loan_payments.entity';
import { AddPaymentDto } from 'src/types/loanTypes';
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
      const fundsOverview =
        await this.fundsOverviewService.getFundsOverviewRecord();
      if (loanData.loan_amount! > fundsOverview.available_funds) {
        throw new Error('Not enough funds');
      }
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
      await this.userFinacialsService.recordLoanTaken(
        user,
        loanRecord.loan_amount,
      );
      await this.fundsOverviewService.addLoan(loanRecord.loan_amount);
      return this.loansRepository.save(loanRecord);
    } catch (error) {
      return error.message;
    }
  }

  async addPayment(paymentData: AddPaymentDto): Promise<LoanPaymentEntity> {
    try {
      const loan = await this.loansRepository.findOne({
        where: { id: paymentData.loanId },
        relations: ['user'],
      });
      if (!loan) {
        throw new Error('Loan not found');
      }
      const newPayment = this.paymentsRepository.create({
        loan: loan,
        payment_date: paymentData.payment_date,
        amount_paid: paymentData.amount_paid,
      });
      await this.paymentsRepository.save(newPayment);
      loan.remaining_balance -= paymentData.amount_paid;

      await this.loansRepository.save(loan);
      const year = getYearFromDate(newPayment.payment_date);
      await this.userFinancialsByYearService.recordLoanRepaid(
        loan.user,
        year,
        paymentData.amount_paid,
      );
      await this.userFinacialsService.recordLoanRepaid(loan.user, paymentData.amount_paid);
      await this.fundsOverviewService.repayLoan(paymentData.amount_paid);
      return newPayment;
    } catch (error) {
      return error.message;
    }
  }
}
