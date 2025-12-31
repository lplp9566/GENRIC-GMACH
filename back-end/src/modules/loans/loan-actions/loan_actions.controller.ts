import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LoanActionsService } from './loan_actions.service';
import { LoanActionDto } from '../loan-dto/loanTypes';
@Controller('loan-actions')
export class LoanActionsController {
  constructor(private readonly loanPaymentsService: LoanActionsService) {}

  @Post()
  async addLoanAction(@Body() actionData: LoanActionDto) {
    return this.loanPaymentsService.handleLoanAction(actionData);
  }
  @Get()
  async getAllActions() {
    return this.loanPaymentsService.getAllActions();
  }
  @Patch(':id')
  edit(@Param('id') id: string, @Body() body: { date?: Date; value?: number }) {
    return this.loanPaymentsService.editPayment(+id, body);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loanPaymentsService.deletePayment(+id);
  }
}
