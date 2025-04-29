import { Body, Controller, Get, Post } from '@nestjs/common';
import { InvestmentTransactionService } from './investment-transactions.service';
import { TransactionType } from 'src/modules/investments/investmentsTypes';

@Controller('investment-transactions')
export class InvestmentTransactionController {
  constructor(private readonly transactionService: InvestmentTransactionService) {}

  // ✅ יצירת פעולה חדשה (Transaction)
  @Post('create')
  async createTransaction(@Body() body: {
    investmentId: number;
    transaction_type: TransactionType;
    amount: number;
    transaction_date: Date;
    note?: string;
  }) {
    return this.transactionService.createTransaction(body);
  }

  // ✅ שליפה לפי מזהה השקעה
  @Post('by-investment')
  async getTransactionsByInvestmentId(@Body() body: { investmentId: number }) {
    return this.transactionService.getTransactionsByInvestmentId(body.investmentId);
  }

  // ✅ שליפת כל הפעולות (כולל relation להשקעות)
  @Get('all')
  async getAllTransactions() {
    return this.transactionService.getAllTransactions();
  }

  // ✅ סינון מתקדם לפי תנאים (ID השקעה, סוג פעולה, תאריכים)
  @Post('filter')
  async filterTransactions(@Body() body: {
    investmentId?: number;
    transaction_type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.transactionService.filterTransactions(body);
  }
}
