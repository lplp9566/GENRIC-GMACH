import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({ name: 'funds_overview_by_year_view' , synchronize: false})
export class FundsOverviewByYearViewEntity {
  @ViewColumn()
  id: number;

  @ViewColumn()
  year: number;

  @ViewColumn()
  total_monthly_deposits: number;

  @ViewColumn()
  total_equity_donations: number;

  @ViewColumn()
  special_fund_donations: number;

  @ViewColumn()
  total_special_funds_withdrawn: number;

  @ViewColumn()
  total_loans_taken: number;

  @ViewColumn()
  total_loans_amount: number;

  @ViewColumn()
  total_loans_repaid: number;

  @ViewColumn()
  total_fixed_deposits_added: number;

  @ViewColumn()
  total_fixed_deposits_withdrawn: number;

  @ViewColumn()
  total_standing_order_return: number;

  @ViewColumn()
  total_investments_out: number;

  @ViewColumn()
  total_investments_in: number;

  @ViewColumn()
  fund_details_donated: Record<string, number>;

  @ViewColumn()
  fund_details_withdrawn: Record<string, number>;

  @ViewColumn()
  total_expenses: number;

  @ViewColumn()
  total_donations: number;
}
