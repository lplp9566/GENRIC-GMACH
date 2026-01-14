import { IsDateString, IsNumber, IsString } from "class-validator";

export class CreateBankCurrentDto {
  @IsString()
  bank_name: string;

  @IsDateString()
  date: string;

  @IsNumber()
  amount: number;
}
