import { forwardRef, Module } from '@nestjs/common';
import { InvestmentTransactionController } from './investment-transactions.controller';
import {InvestmentTransactionService }from './investment-transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { InvestmentsModule } from '../investments.module';
import { InvestmentTransactionEntity } from './entity/investment-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvestmentTransactionEntity]),forwardRef(() => InvestmentsModule)],
  controllers: [InvestmentTransactionController],
  providers: [InvestmentTransactionService,InvestmentTransactionEntity],
  exports : [InvestmentTransactionService,TypeOrmModule]
})
export class InvestmentTransactionsModule {}
