import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { LoanPaymentActionType } from '../../loan-dto/loanTypes';
import { LoanEntity } from '../../Entity/loans.entity';
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
