import { UserRole } from "../Users/UsersDto";

export interface ILoan {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    id_number: string;
    join_date: Date;
    password: string;
    email_address: string;
    phone_number: string;
    role: UserRole;
    is_admin: boolean;
  };
  loan_amount: number;
  loan_date: string;
  purpose: string;
  monthly_payment: number;
  payment_date: number;
  isActive: boolean;
  remaining_balance: number;
  initialMonthlyPayment: number;
  total_installments: number;
  balance: number;
}
export interface ILoanAction {
  id: number;
  loan: ILoan;
  action_type: LoanPaymentActionType;
  date: string;
  value: number;
}
export interface ICreateLoan {
  user: number;
  loan_amount: number;
  loan_date: string;
  purpose: string;
  monthly_payment: number;
  payment_date: number;
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
