export interface LoanActionDto{
    loanId: number; 
    date: Date;
    value: number 
    action_type: LoanPaymentActionType;
    note?: string;
}
export interface PaymentEvent {
    date: Date;                         
    amount: number;                     
    action_type: LoanPaymentActionType; 
  }

export enum LoanPaymentActionType {
    LOAN_CREATED = 'LOAN_CREATED',
    PAYMENT = 'PAYMENT', 
    AMOUNT_CHANGE = 'AMOUNT_CHANGE', 
    MONTHLY_PAYMENT_CHANGE = 'MONTHLY_PAYMENT_CHANGE',
    DATE_OF_PAYMENT_CHANGE = 'DATE_OF_PAYMENT_CHANGE', 
  }
  export interface CreateLoan {
    loan_date: Date; 
    loan_amount: number; 
    monthly_payment: number;  
    payment_date: number; 
    user: number; 
  }
  
