import { JoinColumn, OneToOne, ViewColumn, ViewEntity } from 'typeorm';
import { UserEntity } from '../user.entity';

@ViewEntity({ name: 'user_financial_view', synchronize: false })
export class UserFinancialViewEntity {
  @ViewColumn()
  id: number;

  @ViewColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => UserEntity, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ViewColumn()
  total_donations: number;

  @ViewColumn()
  total_monthly_deposits: number;

  @ViewColumn()
  total_equity_donations: number;

  @ViewColumn()
  total_cash_holdings: number;

  @ViewColumn()
  total_special_fund_donations: number;

  // ✅ חדש
  @ViewColumn()
  total_loans_taken_count: number;

  // ✅ חדש
  @ViewColumn()
  total_loans_taken_amount: number;

  @ViewColumn()
  total_loans_repaid: number;

  @ViewColumn()
  total_fixed_deposits_deposited: number;

  @ViewColumn()
  total_fixed_deposits_withdrawn: number;

  @ViewColumn()
  total_standing_order_return: number;
}
