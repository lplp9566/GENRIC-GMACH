import { IUser } from "../Users/UsersDto";

export interface IOrdersReturnDto {
  id?: number;
  user: IUser;
  date: string;
  amount: number;
  paid: boolean;
  paid_at: string | null;
  note?: string | null;
}
export interface CreateOrdersReturnDto {
  userId: number;
  date: string;
  amount: number;
  note?: string | null;
}
export  interface PayOrdersReturnDto {
  id: number;
  paid_at: string;
}
