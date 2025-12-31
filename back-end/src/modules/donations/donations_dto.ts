export interface IWindowDonations {
    fundName : string;
    amount : number;
    date : Date;
    userId ? : number
    actionType : DonationActionType;
    note ? : string;
}

export enum DonationActionType {
    donation = 'donation',
    withdraw = 'withdraw',
}