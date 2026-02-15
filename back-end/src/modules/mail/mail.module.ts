import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { ReceiptsDailyCronService } from './receipts-daily-cron.service';
import { LoanActionEntity } from '../loans/loan-actions/Entity/loan_actions.entity';
import { DepositsActionsEntity } from '../deposits/deposits-actions/Entity/deposits-actions.entity';
import { MonthlyDepositsEntity } from '../monthly_deposits/monthly_deposits.entity';
import { OrderReturnEntity } from '../order-return/Entity/order-return.entity';
import { DonationsEntity } from '../donations/Entity/donations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoanActionEntity,
      DepositsActionsEntity,
      MonthlyDepositsEntity,
      OrderReturnEntity,
      DonationsEntity,
    ]),
  ],
  controllers: [MailController],
  providers: [MailService, ReceiptsDailyCronService],
  exports:[MailService]
})
export class MailModule {}
