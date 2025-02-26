import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { LoanPaymentEntity } from './loan-payments/loan_payments.entity';

@Entity('loans')
export class LoanEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.loans, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({type:"date"})
  loan_amount: number;

  @Column()
  loan_date: Date;

  @Column()
  monthly_payment: number;

  @Column()
  payment_date:number;

  @Column()
  remaining_balance: number;

  @OneToMany(() => LoanPaymentEntity, (payment) => payment.loan, {
    cascade: true,
  })
  payments: LoanPaymentEntity[];
}
