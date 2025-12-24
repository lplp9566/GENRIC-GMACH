import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({ name: 'funds_overview_view', synchronize: false })
export class FundsOverviewViewEntity {
  @ViewColumn()
  id: number;

  @ViewColumn()
  own_equity: number;

  @ViewColumn()
  fund_principal: number;

  @ViewColumn()
  total_loaned_out: number;

  @ViewColumn()
  total_invested: number;

  @ViewColumn({ name: 'Investment_profits' })
  Investment_profits: number;

  @ViewColumn()
  special_funds: number;

  @ViewColumn()
  monthly_deposits: number;

  @ViewColumn()
  total_donations: number;

  @ViewColumn()
  total_equity_donations: number;

  @ViewColumn()
  available_funds: number;

  @ViewColumn()
  cash_holdings: number;

  @ViewColumn()
  total_user_deposits: number;

  @ViewColumn()
  total_expenses: number;

  @ViewColumn()
  standing_order_return: number;

  @ViewColumn()
  fund_details: Record<string, number>;
}
