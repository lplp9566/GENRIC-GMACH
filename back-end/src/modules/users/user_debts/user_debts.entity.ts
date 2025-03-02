import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../user.entity';
import { MonthlyDepositsEntity } from '../../monthly_deposits/monthle_deposits.entity';
import { LoanPaymentEntity } from '../../loans/loan-payments/loan_payments.entity';

@Entity('user_debts')
export class UserDebtsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.debts)
  user: UserEntity;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'float', default: 120 })
  total_due: number;

  @Column({ type: 'float', default: 0 })
  amount_paid: number;

  @Column({ type: 'float', default: 120 })
  remaining_debt: number;

  @ManyToOne(() => MonthlyDepositsEntity, deposit => deposit.debt, { nullable: true })
  deposit_payment: MonthlyDepositsEntity | null; // ✅ אם החוב שולם דרך תשלום חודשי

//   @ManyToOne(() => LoanPaymentEntity, loanPayment => loanPayment.debt, { nullable: true })
//   loan_payment: LoanPaymentEntity | null; // ✅ אם החוב שולם דרך החזר הלוואה
}
