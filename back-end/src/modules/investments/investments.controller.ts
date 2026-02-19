import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { InvestmentInit } from './investments_dto';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  // ✅ יצירת השקעה ראשונית
  @Post()
  async createInitialInvestment(@Body() body: InvestmentInit
) {
    return this.investmentsService.createInitialInvestment(body);
  }

  // ✅ הוספת קרן להשקעה קיימת
  @Post('add-to-investment')
  async addInvestment(@Body() body: {
    id: number;
    amount: number;
    date: Date;
  }) {
    return this.investmentsService.addToInvestment(body);
  }

  // ✅ עדכון ערך השקעה
  @Post('update-value')
  async updateCurrentValue(@Body() body: {
    id: number;
    new_value: number;
    date: Date;
  }) {
    return this.investmentsService.updateCurrentValue(body);
  }

  // ✅ משיכה מהשקעה
  @Post('withdraw')
  async withdraw(@Body() body: {
    id: number;
    amount: number;
    date: Date;
  }) {
    return this.investmentsService.withdraw(body);
  }

  // ✅ דמי ניהול
  @Post('management-fee')
  async applyManagementFee(@Body() body: {
    id: number;
    feeAmount: number;
    date: Date;
  }) {
    return this.investmentsService.applyManagementFee(body);
  }

  // ✅ שליפת השקעה בודדת
  @Post('get-by-id')
  async getInvestmentById(@Body() body: { id: number }) {
    return this.investmentsService.getInvestmentById(body.id);
  }

  // ✅ שליפת כל ההשקעות
  @Get()
  async getAllInvestments() {
    return this.investmentsService.getAllInvestments();
  }
  @Get('active_investments')
  async getActiveInvestments() {
    return this.investmentsService.getActiveInvestments();
  }

  @Patch(':id')
  async updateInvestment(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<
      Pick<
        InvestmentInit,
        | 'investment_name'
        | 'investment_by'
        | 'company_name'
        | 'investment_portfolio_number'
        | 'start_date'
      >
    >,
  ) {
    return this.investmentsService.updateInvestment(id, body);
  }

  @Delete(':id')
  async deleteInvestment(@Param('id', ParseIntPipe) id: number) {
    return this.investmentsService.deleteInvestment(id);
  }
}
