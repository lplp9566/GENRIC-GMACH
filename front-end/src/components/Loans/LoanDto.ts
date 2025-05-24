import { UserRole } from "../NavBar/Users/UsersDto";

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
  monthly_payment: number;
  isActive: boolean;
  remaining_balance: number;
  initialMonthlyPayment: number;
  total_installments: number;
}
export interface ILoanAction {
  id: number;
  loan: ILoan;
  action_type: LoanPaymentActionType;
  date: string;
  value: number;
}
 export enum LoanPaymentActionType {
  PAYMENT = "PAYMENT",
  AMOUNT_CHANGE = "AMOUNT_CHANGE",
  MONTHLY_PAYMENT_CHANGE = "MONTHLY_PAYMENT_CHANGE",
  DATE_OF_PAYMENT_CHANGE = "DATE_OF_PAYMENT_CHANGE",
}
