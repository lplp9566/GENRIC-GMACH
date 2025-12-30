import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

export class EditLoanDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  loan_amount?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  monthly_payment?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  payment_date?: number;

  @IsOptional()
  @IsDateString()
  loan_date?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  guarantor1?: any;

  @IsOptional()
  guarantor2?: any;

    @IsOptional()
   purpose?: string;

  @IsOptional()
  @IsDateString()
  first_payment_date?: string;  
}
