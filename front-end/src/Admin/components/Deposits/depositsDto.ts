import { IUser } from "../Users/UsersDto";

export interface IDeposit {
    id: number;
    user: IUser;
    initialDeposit: number;
    current_balance: number;
    start_date: Date;
    end_date?: Date;
    isActive: boolean;
}
export interface ICreateDeposits{
    user: number;
    initialDeposit: number;
    start_date: string;
    end_date: string;
}
export enum DepositActionsType{
    InitialDeposit = 'InitialDeposit',
    AddToDeposit = 'AddToDeposit',
    RemoveFromDeposit = 'RemoveFromDeposit',
    ChangeReturnDate = 'ChangeReturnDate', 
}
export interface IDepositAction {
    id: number;
    actionType?: DepositActionsType;
    action_type?: DepositActionsType;
    amount?: number;
    date: Date;
    update_date?: Date | null;
    deposit?: {
        id: number;
        user?: IUser;
    };
}
export interface IDepositActionCreate {
    deposit: number;
    action_type: DepositActionsType;
    amount?: number;
    date: string;
    update_date?: string | null;
 
}

export interface IDepositActionUpdate {
  amount?: number;
  date?: string;
  update_date?: string | null;
}
