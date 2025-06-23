export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  id_number: string;
  join_date: Date;
  password: string;
  phone_number: string;
  email: string;
  role: UserRole;
  iS_admin: boolean;
  payment_details: IPaymentDetails;
}
export interface IPaymentDetails {
  id: number;
  bank_number: number;
  bank_branch: number;
  bank_account_number: number;
  charge_date: string;
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

export enum UserRole {
  president = "president",
  committeeMember = "committeeMember",
  member = "member",
  admin = "admin",
}
export interface IUsers{
    users : IUser[]
}
export type Status = "idle" | "pending" | "fulfilled" | "rejected";

export interface IFormUserData {
    first_name: string;
    last_name: string;
    id_number: string;
    join_date: Date;
    password: string;
    confirmPassword: string;
    phone_number: string;
    email: string;
    role: UserRole;
    iS_admin: boolean;
 
}

  export interface IFormPaymentData {
    bank_number: number;
    bank_branch: number;
    bank_account_number: number;
    charge_date: string;
    payment_method: payment_method;
  }
  export interface IAddUserFormData {
    userData: IFormUserData;
    paymentData: IFormPaymentData;
  }