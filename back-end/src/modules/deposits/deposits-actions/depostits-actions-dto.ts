export enum DepositActionsType{
    InitialDeposit = 'InitialDeposit',
    AddToDeposit = 'AddToDeposit',
    RemoveFromDeposit = 'RemoveFromDeposit',
    ChangeReturnDate = 'ChangeReturnDate', 
}
export interface IDepositAction{
    deposit : number
    amount ?: number
    date : Date
    action_type : DepositActionsType
    update_date ?: Date
}

export interface IUpdateDepositAction {
  amount?: number;
  date?: Date;
  update_date?: Date | null;
}
