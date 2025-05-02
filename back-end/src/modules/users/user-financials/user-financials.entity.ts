import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../user.entity';

@Entity('user-financials')
export class UserFinancialEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserEntity, (user) => user, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  // Total contributed to charity, including both donations and membership fees
  @Column({ type: 'float' })
  total_donations: number;

  // סך ההפקדות החודשיות
  @Column({ type: 'float' })
  total_monthly_deposits: number;

  @Column({ type: 'float' })
  total_equity_donations: number;
  @Column({ type: 'float' })
  total_cash_holdings: number;
  @Column({ type: 'float' })
  total_special_fund_donations: number;

  @Column({ type: 'int' })
  total_loans_taken: number;

  @Column({ type: 'float' })
  total_loans_repaid: number;

  @Column({ type: 'float' })
  total_fixed_deposits_deposited: number;

  @Column({ type: 'float' })
  total_fixed_deposits_withdrawn: number;
}
