import { Module } from '@nestjs/common';
import { DepositsActionsController } from './deposits-actions.controller';
import { DepositsActionsService } from './deposits-actions.service';

@Module({
  controllers: [ DepositsActionsController],
  providers: [DepositsActionsService]
})
export class DepositsActionsModule {}
