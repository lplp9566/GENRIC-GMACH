import { forwardRef, Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { UsersModule } from '../users/users.module';
import { MonthlyDepositsModule } from '../monthly_deposits/monthly_deposits.module';
import { WhatsappPaymentsFlowService } from './WhatsappPaymentsFlowService';

@Module({
    imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => MonthlyDepositsModule),
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService,WhatsappPaymentsFlowService],
  exports: [WhatsappService,WhatsappPaymentsFlowService],
})
export class WhatsappModule {}
