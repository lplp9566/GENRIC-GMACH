import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { LoanPaymentEntity } from './loan-actions/loan_actions.entity';

@Entity('loans')
export class LoanEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.loans, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ type: 'float' })
  loan_amount: number;



  @Column({ type: 'date' })
  loan_date: Date;

  @Column({ type: 'float' })
  monthly_payment: number;

  @Column({ type: 'int' })
  payment_date: number;
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'float', nullable: true })
  remaining_balance: number;
  @Column({type:"int"})
  initialMonthlyPayment  : number;
  @Column({ type: 'float' , nullable: true })
  total_installments: number;
  @OneToMany(() => LoanPaymentEntity, (payment) => payment.loan, {
    cascade: true,
  })
  payments: LoanPaymentEntity[];
}
