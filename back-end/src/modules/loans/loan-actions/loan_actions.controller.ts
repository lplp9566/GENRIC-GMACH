import { Body, Controller, Post } from "@nestjs/common";
import { LoanActionsService } from "./loan_actions.service";
import { LoanActionDto } from "../loan-dto/loanTypes";
@Controller("loan-actions")
export class LoanActionsController {
  constructor(private readonly loanPaymentsService: LoanActionsService) {
    console.log("🚀 LoanActionsController loaded");
  }
  
  @Post()
  async addPayment(@Body() actionData: LoanActionDto) {
    return this.loanPaymentsService.handleLoanAction(actionData);
  }
}


    