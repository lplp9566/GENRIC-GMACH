
export interface IFundsOverview {
    id: number;
    own_equity: number;
    fund_principal: number;
    total_loaned_out: number;
    total_invested: number;
    Investment_profits: number;
    special_funds: number;
    monthly_deposits: number;
    total_donations: number;
    total_equity_donations: number;
    available_funds: number;
    cash_holdings: number;
    total_user_deposits: number;
    total_expenses: number;
    standing_order_return: number;
      special_funds_net:number;
      special_funds_gross:number
    fund_details: Record<string, number>; 
  }
  export interface IFundsOverviewByYear {
    id: number;
    year: number;
    total_monthly_deposits: number;
    total_equity_donations: number;
    special_fund_donations: number;
    total_special_funds_withdrawn: number;
    total_loans_taken: number;
    total_loans_amount: number;
    total_loans_repaid: number;
    total_fixed_deposits_added: number;
    total_fixed_deposits_withdrawn: number;
    total_standing_order_return: number;
    total_investments_out: number;
    total_investments_in: number;
    fund_details_donated: Record<string, number>;
    fund_details_withdrawn: Record<string, number>;
    total_expenses: number;
    total_donations: number;
  }
  
  export interface  IUserFundsOverviewByYear {
    id: number;
    year: number;
    total_monthly_deposits: number;
    total_equity_donations: number;
    special_fund_donations: number;
    total_loans_taken: number;
    total_loans_repaid: number;
    total_fixed_deposits_added: number;
    total_fixed_deposits_withdrawn: number;
    total_standing_order_return: number;
    total_donations: number;
  }