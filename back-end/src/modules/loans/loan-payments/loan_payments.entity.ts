import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { LoanEntity } from '../loans.entity';
import { UserDebtsEntity } from 'src/modules/users/user_debts/user_debts.entity';

@Entity('loan_payments')
export class LoanPaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanEntity, (loan) => loan.payments, { onDelete: 'CASCADE' })
  loan: LoanEntity;

  @Column({ type: 'date' })
  payment_date: Date;

  @Column()
  amount_paid: number;
  
//   @OneToMany(() => UserDebtsEntity, (debt) => debt.loan_payment)
//   debt: UserDebtsEntity;
}
