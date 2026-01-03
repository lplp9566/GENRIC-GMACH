export interface IExpenses {
    id:number ;
    amount:number ;
    note? :string ;
    expenseDate: string ;
    category:IExpensesCategory
}
export interface IExpensesCategory {
    id:number;
    name:string
}