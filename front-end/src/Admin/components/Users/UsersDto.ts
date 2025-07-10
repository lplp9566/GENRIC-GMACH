export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  id_number: string;
  join_date: Date;
  password: string;
  phone_number: string;
  email: string;
  iS_admin: boolean;
  payment_details: IPaymentDetails;
}
export interface IPaymentDetails {
  bank_number: number;
  bank_branch: number;
  bank_account_number: number;
  charge_date: number;
  payment_method: payment_method;
  monthly_balance: number;
  loan_balances: { loanId: number; balance: number }[];
}
export enum payment_method {
  direct_debit = 'direct_debit',
  credit_card = 'credit_card',
  bank_transfer = 'bank_transfer',
  cash = 'cash',
  other = 'other',
}

export interface IUsers{
    users : IUser[]
}
export type Status = "idle" | "pending" | "fulfilled" | "rejected";



export interface ICreateUser {
    first_name: string;
    last_name: string;
    id_number: string;
    join_date: string;
    password: string;
    email_address: string;
    phone_number: string;
    is_admin: boolean;
    current_role: number;
}
export interface ICreatePaymentDetails {
    bank_number: number;
    bank_branch: number;
    bank_account_number: number;
    charge_date: number | null;
    payment_method: payment_method;
}

  export interface IAddUserFormData {
    userData: ICreateUser;
    paymentData: ICreatePaymentDetails;
  }