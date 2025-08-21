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
    startDate: string;
    endDate: string;
}
export enum DepositActionsType{
    AddToDeposit = 'AddToDeposit',
    RemoveFromDeposit = 'RemoveFromDeposit',
    ChangeReturnDate = 'ChangeReturnDate', 
}
export interface IDepositAction {
    id: number;
    actionType: DepositActionsType;
    amount: number;
    date: Date;
    update_date: Date | null;
}
export interface IDepositActionCreate {
    deposit: number;
    action_type: DepositActionsType;
    amount?: number;
    date: string;
    update_date?: string | null;
 
}