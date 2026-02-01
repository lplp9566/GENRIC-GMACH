export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  id_number: string;
  join_date: Date | null;
  password: string;
  phone_number: string;
  email_address: string;
  iS_admin: boolean;
  permission?: "user" | "admin_read" | "admin_write";
  is_member: boolean;
  notify_account?: boolean | null;
  notify_receipts?: boolean | null;
  notify_general?: boolean | null;
  spouse_first_name?: string | null;
  spouse_last_name?: string | null;
  spouse_id_number?: string | null;
  payment_details: IPaymentDetails;
  current_role: ICurrentRole;
  membership_type: MembershipType;
}
export interface ICurrentRole {
  id: number;
  name: string;
}
export interface IPaymentDetails {
  bank_number: number;
  bank_branch: number;
  bank_account_number: number;
  charge_date: number;
  payment_method: payment_method_enum;
  monthly_balance: number;
  loan_balances: { loanId: number; balance: number }[];
}
export enum payment_method_enum {
  direct_debit = "direct_debit",
  credit_card = "credit_card",
  bank_transfer = "bank_transfer",
  cash = "cash",
  other = "other",
}

export interface IUsers {
  users: IUser[];
}
export type Status = "idle" | "pending" | "fulfilled" | "rejected";

export interface ICreateUser {
  first_name: string;
  last_name: string;
  id_number: string;
  join_date: string | null;
  password: string;
  email_address: string;
  phone_number: string;
  is_admin: boolean;
  permission?: "user" | "admin_read" | "admin_write";
  current_role: number | null;
  membership_type: MembershipType;
  spouse_first_name?: string | null;
  spouse_last_name?: string | null;
  spouse_id_number?: string | null;
}
export interface ICreatePaymentDetails {
  bank_number: number | null;
  bank_branch: number | null;
  bank_account_number: number | null;
  charge_date: number | null;
  payment_method: payment_method_enum;
}

export interface IAddUserFormData {
  userData: ICreateUser;
  paymentData: ICreatePaymentDetails;
}
export enum MembershipType {
  FRIEND = "FRIEND",
  MEMBER = "MEMBER",
}
