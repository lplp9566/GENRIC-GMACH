import { IsObject, IsOptional } from "class-validator"
import { UserEntity } from "./user.entity"
import { PaymentDetailsEntity } from "./payment-details/payment_details.entity"


export enum payment_method {
  direct_debit = 'direct_debit',
  credit_card = 'credit_card',
  bank_transfer = 'bank_transfer',
  cash = 'cash',
  other = 'other',
}

export interface ICreateUser {
userData: IUserCreate
paymentData: IPaymentDetails
}

export enum MembershipType{
  MEMBER = 'MEMBER',
  FRIEND = 'FRIEND',}
export interface IUserCreate {
  first_name: string
  last_name: string
  id_number: string
  join_date: Date
  password: string
  email_address: string
  phone_number: string
  is_admin: boolean
  current_role: number
}
export interface IPaymentDetails{
bank_number: number
bank_branch: number
bank_account_number: number
charge_date: string
payment_method: payment_method
}

export class UpdateUserWithPaymentDto {
  @IsOptional()
  @IsObject()
  userData?: Partial<UserEntity>;

  @IsOptional()
  @IsObject()
  paymentData?: Partial<PaymentDetailsEntity>;
}