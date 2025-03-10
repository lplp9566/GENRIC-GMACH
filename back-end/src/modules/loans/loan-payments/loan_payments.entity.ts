import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { LoanEntity } from '../loans.entity';
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
  

}
