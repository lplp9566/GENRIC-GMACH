import { Body, Controller, Post } from "@nestjs/common";
import { LoanPaymentsService } from "./loan_payments.service";
import { LoanActionDto } from "src/modules/loans/loan-dto/loanTypes";

@Controller("loan-payments")
export class LoanPaymentsController {
  constructor(private readonly loanPaymentsService: LoanPaymentsService) {}
  
  @Post('payment')
  async addPayment(@Body() actionData: LoanActionDto) {
    return this.loanPaymentsService.handleLoanAction(actionData);
  }
}


    