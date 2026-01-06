import { IsOptional } from "class-validator";

export class UpdateExpensesDto{
    amount:number;
    @IsOptional()
    note:string;
    expenseDate:string
}