import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { LoanEntity } from '../loans.entity';
import { LoanPaymentActionType } from '../../loan-dto/loanTypes';
@Entity('loan_actions')
export class LoanActionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanEntity, (loan) => loan.payments, { onDelete: 'CASCADE' })
  loan: LoanEntity;

  @Column({
    type: 'enum',
    enum: LoanPaymentActionType,
  })
  action_type: LoanPaymentActionType;
  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column()
  value: number;
}
