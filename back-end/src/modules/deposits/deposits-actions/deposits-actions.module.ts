import { Module } from '@nestjs/common';
import { DepositsActionsController } from './deposits-actions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositsActionsService } from './deposits-actions.service';
import { DepositsActionsEntity } from './deposits-actions.entity';
import { DepositsModule } from '../deposits.module';
import { DepositsEntity } from '../deposits.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DepositsActionsEntity,DepositsEntity]),
    DepositsModule
  ],
  controllers: [ DepositsActionsController],
  providers: [DepositsActionsService],
  exports: [DepositsActionsService]
})
export class DepositsActionsModule {}
