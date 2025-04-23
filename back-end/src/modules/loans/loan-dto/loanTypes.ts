export interface LoanActionDto{
    loanId: number; 
    date: Date;
    amount: number 
    action_type: LoanPaymentActionType;
    note?: string;
}
export interface PaymentEvent {
    date: Date;                         
    amount: number;                     
    action_type: LoanPaymentActionType; 
  }

export enum LoanPaymentActionType {
    PAYMENT = 'PAYMENT', 
    AMOUNT_CHANGE = 'AMOUNT_CHANGE', 
    MONTHLY_PAYMENT_CHANGE = 'MONTHLY_PAYMENT_CHANGE',
    DATE_OF_PAYMENT_CHANGE = 'DATE_OF_PAYMENT_CHANGE', 
  }
  