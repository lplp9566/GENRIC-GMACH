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
}
export interface ICreateDonation {
    user:number
    date:Date
    amount:number
    action:DonationActionType
    donation_reason:string
}

