import { Module } from '@nestjs/common';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositsActionsModule } from './deposits-actions/deposits-actions.module';

@Module({
  imports:[TypeOrmModule.forFeature(), DepositsModule, DepositsActionsModule],
  controllers: [DepositsController],
  providers: [DepositsService],
  exports: [DepositsService],
})
export class DepositsModule {}
