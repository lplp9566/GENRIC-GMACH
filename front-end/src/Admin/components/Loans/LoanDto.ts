import { IUser } from "../Users/UsersDto";


export interface ILoanWithUser {
  id: number;
  user: IUser;
  initial_loan_amount: number;
  loan_amount: number;
  loan_date: string;
  purpose: string;
  monthly_payment: number;
  payment_date: number;
  isActive: boolean;
  remaining_balance: number;
  initial_monthly_payment: number;
  total_installments: number;
  total_remaining_payments: number;
  balance: number;
  guarantor1: string | null;
  guarantor2: string | null;
}
export interface ILoanAction {
  id: number;
  loan: ILoanWithUser;
  action_type: LoanPaymentActionType;
  date: string;
  value: number;
}
export interface ICreateLoanAction {
  loanId: number;
  value: number;
  date: string;
  action_type: LoanPaymentActionType;
}
export interface ICreateLoan {
  user: number;
  loan_amount: number;
  loan_date: string;
  purpose: string;
  monthly_payment: number;
  payment_date: number;
  guarantor1?: string | null;
  guarantor2?: string | null;
}
export interface ILoanCheckResponse {
  ok: boolean;
  error: string;
}
export enum LoanPaymentActionType {
  PAYMENT = "PAYMENT",
  AMOUNT_CHANGE = "AMOUNT_CHANGE",
  MONTHLY_PAYMENT_CHANGE = "MONTHLY_PAYMENT_CHANGE",
  DATE_OF_PAYMENT_CHANGE = "DATE_OF_PAYMENT_CHANGE",
}
type ILoanBase = Omit<ILoanWithUser, 'user'>;

export interface ILoanWithPayment extends ILoanBase {
  actions:ILoanAction[] ;
}
// export interface LoanActionType {
//   id: number;
//   action_type: LoanPaymentActionType;
//   date: string;
//   value: number;
// }

export const ActionTypes = [
  {
    label:'תשלום הלוואה',
    value:LoanPaymentActionType.PAYMENT
  },
  {
    label:'הוספת סכום הלוואה',
    value:LoanPaymentActionType.AMOUNT_CHANGE
  },  
  {
    label:'שינוי תשלום חודשי',
    value:LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE
  },
  {
    label:'שינוי יום תשלום בחודש',
    value:LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE
  },
]