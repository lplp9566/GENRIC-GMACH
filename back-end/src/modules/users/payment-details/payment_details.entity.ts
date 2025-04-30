import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { UserEntity } from '../user.entity';
import { payment_method } from 'src/modules/users/userTypes';

@Entity('payment_details')
export class PaymentDetailsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserEntity, (user) => user.payment_details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: "user_id" }) 
  user: UserEntity;

  @Column()
  bank_number: number;

  @Column()
  bank_branch: number;

  @Column()
  bank_account_number: number;

  @Column()
  charge_date: string;

  @Column()
  payment_method: payment_method;

  @Column({ type: 'float', default: 0 })
  monthly_balance: number; 

  @Column({ type: 'json', default: [] })
  loan_balances: { loanId: number; balance: number }[];
}
