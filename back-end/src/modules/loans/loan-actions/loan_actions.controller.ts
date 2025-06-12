import { Body, Controller, Get, Post } from "@nestjs/common";
import { LoanActionsService } from "./loan_actions.service";
import { LoanActionDto } from "../loan-dto/loanTypes";
@Controller("loan-actions")
export class LoanActionsController {
  constructor(private readonly loanPaymentsService: LoanActionsService) {
  }
  
  @Post()
  async addLoanAction(@Body() actionData: LoanActionDto) {
    return this.loanPaymentsService.handleLoanAction(actionData);
  }
  @Get()
  async getAllActions() {
    return this.loanPaymentsService.getAllActions();
  }
}


    