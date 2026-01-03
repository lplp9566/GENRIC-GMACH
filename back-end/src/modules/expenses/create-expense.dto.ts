// create-expense.dto.ts
import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateExpenseDto {
  @IsNumber()
  amount: number;

  @IsDateString()
  expenseDate: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNumber()
  category_id: number;
}
