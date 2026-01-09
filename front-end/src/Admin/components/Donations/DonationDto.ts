import { IUser } from "../Users/UsersDto";

export enum DonationActionType {
    donation = 'donation',
    withdraw = 'withdraw',
}
export interface IDonation{
    id:number;
    user: IUser;
    action: DonationActionType;
    amount: number;
    date: string;
    donation_reason: string
    note?: string,
    fond:IFundDonation
}
export interface ICreateDonation {
    user?:number
    date:string
    amount:number
    action:DonationActionType
    donation_reason:string
    note?: string
}

export interface IUpdateDonation {
    id:number
    date:string
    amount:number
    note?: string
}
export interface IFundDonation {
       id: number,
       name: string,
       createdAt:Date
       balance:string
}
export interface ICreateFund{
    name:string
}
