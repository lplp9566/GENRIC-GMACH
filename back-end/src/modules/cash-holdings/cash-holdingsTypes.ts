export enum CashHoldingsTypesRecordType {
    initialize = 'initialize',
    add = 'add',
    subtract = 'subtract',

}
export interface CashHoldingRequest {
    id?: number;
    amount : number ;
    user :number ;
    note ? :string ;
    type: CashHoldingsTypesRecordType;
}