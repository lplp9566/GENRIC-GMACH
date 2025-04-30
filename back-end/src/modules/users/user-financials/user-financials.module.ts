import { forwardRef, Module } from '@nestjs/common';
import { UserFinancialController as UserFinancialController } from './user-financials.controller';
import { UserFinancialsService } from './user-financials.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFinancialEntity } from './user-financials.entity';
import { UsersModule } from '../users.module';

@Module({
  imports : [TypeOrmModule.forFeature([UserFinancialEntity]), forwardRef(() => UsersModule)],
  controllers: [UserFinancialController],
  providers: [UserFinancialsService],
  exports: [UserFinancialsService,TypeOrmModule]
})
export class UserFinancialsModule {}
