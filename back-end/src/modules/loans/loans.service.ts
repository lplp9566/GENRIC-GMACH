import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanEntity } from './loans.entity';
import { LoanPaymentEntity } from './loan-payments/loan_payments.entity';
import { AddPaymentDto } from 'src/types/loanTypes';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(LoanEntity)
    private loansRepository: Repository<LoanEntity>,
    @InjectRepository(LoanPaymentEntity)
    private paymentsRepository: Repository<LoanPaymentEntity>,
  ) {}

  async createLoan(loanData: Partial<LoanEntity>): Promise<LoanEntity> {
    const newLoan = this.loansRepository.create(loanData);
    return this.loansRepository.save(newLoan);
  }

  async addPayment(paymentData: AddPaymentDto): Promise<LoanPaymentEntity> {
    const loan = await this.loansRepository.findOne({ where: { id: paymentData.loanId } });
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
    if (loan.remaining_balance < 0) {
      loan.remaining_balance = 0;
    }
    await this.loansRepository.save(loan);
    return newPayment;
  }
}
