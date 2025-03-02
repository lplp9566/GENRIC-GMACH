import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanEntity } from './loans.entity';
import { LoanPaymentEntity } from './loan-payments/loan_payments.entity';
import { AddPaymentDto } from 'src/types/loanTypes';
import { UserFinancialsService } from '../users/user-financials/user-financials.service';
import { FundsOverviewService } from '../funds-overview/funds-overview.service';
import { FundsOverviewEntity } from '../funds-overview/funds-overview.entity';
import { UsersService } from '../users/users.service';
import { getYearFromDate } from '../../services/services';
@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanEntity)
    private loansRepository: Repository<LoanEntity>,
    @InjectRepository(LoanPaymentEntity)
    private paymentsRepository: Repository<LoanPaymentEntity>,
    private readonly user_financialsService: UserFinancialsService,
    private readonly fundsOverviewService: FundsOverviewService,
    private readonly usersService:UsersService,
  ) {}
  


  async createLoan(loanData: Partial<LoanEntity>): Promise<LoanEntity> {
    try {
      const avnbalance =
        await this.fundsOverviewService.getFundsOverviewRecord();
      if (loanData.loan_amount! > avnbalance.available_funds) {
        throw new Error('Not enough funds');
      }
      const newLoan = this.loansRepository.create(loanData);
      newLoan.remaining_balance = newLoan.loan_amount;
     const year =  getYearFromDate(newLoan.loan_date);
      const user = await this.usersService.getUserById(Number(newLoan.user));
      if (!user) {
        throw new Error('User not found');
      }
      await this.user_financialsService.recordLoanTaken(
        user,
        year,
        newLoan.loan_amount,
      );

      await this.fundsOverviewService.addLoan(newLoan.loan_amount);
      return this.loansRepository.save(newLoan);
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
      await this.user_financialsService.recordLoanRepaid(
        loan.user,
        year,
        paymentData.amount_paid,
      );
      await this.fundsOverviewService.repayLoan(paymentData.amount_paid);
      return newPayment;
      
    } catch (error) {
      return error.message;
    }
 
  }
}
