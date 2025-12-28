import { JoinColumn, ManyToOne, ViewColumn, ViewEntity } from 'typeorm';
import { UserEntity } from '../user.entity';

@ViewEntity({ name: 'user_financial_by_year_view', synchronize: false })
export class UserFinancialByYearViewEntity {
  @ViewColumn()
  id: number;

  // העמודה שיוצאת מה-VIEW: user_id
  @ViewColumn({ name: 'user_id' })
  userId: number;

  // אם אתה רוצה לקבל גם את המשתמש עצמו כמו ב-Entity הישן (eager: true)
  @ManyToOne(() => UserEntity, (user) => user.financialHistoryByYear, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ViewColumn()
  year: number;

  @ViewColumn()
  total_monthly_deposits: number;

  @ViewColumn()
  total_equity_donations: number;

  @ViewColumn()
  special_fund_donations: number;

  // ✅ חדש: כמה הלוואות נלקחו (COUNT)
  @ViewColumn()
  total_loans_taken_count: number;

  // ✅ חדש: סכום ההלוואות שנלקחו (SUM loan_amount)
  @ViewColumn()
  total_loans_taken_amount: number;

  @ViewColumn()
  total_loans_repaid: number;

  @ViewColumn()
  total_fixed_deposits_added: number;

  @ViewColumn()
  total_fixed_deposits_withdrawn: number;

  @ViewColumn()
  total_standing_order_return: number;

  @ViewColumn()
  total_donations: number;
}
