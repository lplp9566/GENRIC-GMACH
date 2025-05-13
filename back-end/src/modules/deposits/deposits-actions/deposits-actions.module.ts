import { Module } from '@nestjs/common';
import { DepositsActionsController } from './deposits-actions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositsActionsService } from './deposits-actions.service';
import { DepositsActionsEntity } from './Entity/deposits-actions.entity';
import { DepositsModule } from '../deposits.module';
import { DepositsEntity } from '../Entity/deposits.entity';

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
