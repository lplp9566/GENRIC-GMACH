export interface createInvestment {
  investment_name: string;
  amount: number;
  start_date: Date;
  investment_by: string;
  company_name: string;
  investment_portfolio_number: string;
}

export interface addToInvestment {
  id: number;
  amount: number;
  date: Date;
}
export interface updateInvestmentValue {
  id: number;
  new_value: number;
  date: Date;
}

export interface withdrawFromInvestment {
  id: number;
  amount: number;
  date: Date;
}
export interface applyManagementFee {
  id: number;
  feeAmount: number;
  date: Date;
}
export interface getInvestmentById {
  id: number;
}
export interface getTransactionsByInvestmentId {
  investmentId: number;
}

export interface InvestmentDto {
  id: number;
  investment_name: string;
  investment_by: string;
  company_name: string;
  investment_portfolio_number: string;
  total_principal_invested: string;
  current_value: string;
  principal_remaining: string;
  profit_realized: number;
  withdrawn_total: string;
  management_fees_total: string;
  start_date: Date;
  last_update: Date;
  is_active: boolean;
}
export interface TransactionDto {
  id: number;
  investment: InvestmentDto;
  transaction_type: string;
  amount: string;
  transaction_date: Date;
  note?: string;
}