export enum TransactionType {
    INITIAL_INVESTMENT = 'INITIAL_INVESTMENT',
    ADDITIONAL_INVESTMENT = 'ADDITIONAL_INVESTMENT',
    VALUE_UPDATE = 'VALUE_UPDATE',
    WITHDRAWAL = 'WITHDRAWAL',
    MANAGEMENT_FEE = 'MANAGEMENT_FEE',
  }
  export interface InvestmentInit{
        investment_name: string;
        amount: number;
        start_date: Date;
        investment_by: string;
        company_name: string;
        investment_portfolio_number: string;
  }
    