import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  AfterLoad,
} from 'typeorm';
import { UserEntity } from '../user.entity';

@Entity({ name: 'user_financial_by_year', synchronize: false })
export class UserFinancialByYearEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => UserEntity, (user) => user.financialHistoryByYear, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'float' })
  total_monthly_deposits: number;

  @Column({ type: 'float' })
  total_equity_donations: number;

  @Column({ type: 'float' })
  special_fund_donations: number;

  @Column({ type: 'float' })
  total_loans_taken: number;

  @Column({ type: 'float' })
  total_loans_repaid: number;

  @Column({ type: 'float', default: 0 })
  total_fixed_deposits_added: number;

  @Column({ type: 'float', default: 0 })
  total_fixed_deposits_withdrawn: number;

  @Column({ type: 'float', default: 0 })
  total_standing_order_return: number;

  total_donations: number;

  @AfterLoad()
  calculateTotalDonations() {
    this.total_donations =
      (this.total_equity_donations || 0) + (this.special_fund_donations || 0);
  }
}
