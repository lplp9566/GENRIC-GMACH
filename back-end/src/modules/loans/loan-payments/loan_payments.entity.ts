import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { LoanEntity } from '../loans.entity';
import { LoanPaymentActionType } from 'src/types/loanTypes';
@Entity('loan_payments')
export class LoanPaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanEntity, (loan) => loan.payments, { onDelete: 'CASCADE' })
  loan: LoanEntity;

  @Column(
    {
      type: 'enum',
      enum:LoanPaymentActionType,
      default: LoanPaymentActionType.PAYMENT,
    }
    
  )
  action_type: LoanPaymentActionType;
  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column()
  amount: number;
  

}
