import { UserEntity } from '../../users/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { LoanActionEntity } from '../loan-actions/Entity/loan_actions.entity';

@Entity('loans')
export class LoanEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.loans, { onDelete: 'CASCADE' })
  user: UserEntity;
  @Column({ type: 'int' })
  initial_loan_amount: number;

  @Column({ type: 'float' })
  loan_amount: number;

  @Column({ type: 'date' })
  loan_date: Date;

  @Column({ type: 'text', nullable: true })
  purpose: string; //ropes

  @Column({ type: 'float' })
  monthly_payment: number;

  @Column({ type: 'int' })
  payment_date: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'float' })
  remaining_balance: number;

  @Column({ type: 'float' })
  total_installments: number;

  @Column({ type: 'float' })
  total_remaining_payments: number;

  @Column({ type: 'int' })
  initial_monthly_payment: number;
  @Column({ type: 'date', default: null, nullable: true })
  first_payment_date: Date | null;
  @Column({ type: 'float', default: 0 })
  balance: number;

  @Column({ type: 'text', nullable: true })
  guarantor1: string;

  @Column({ type: 'text', nullable: true,default: null })
  guarantor2: string;


  @OneToMany(() => LoanActionEntity, (payment) => payment.loan, {
    cascade: true,
  })
  actions: LoanActionEntity[];
}
