import { forwardRef, Module } from '@nestjs/common';
import { UserFinancialsController } from './user-financials.controller';
import { UserFinancialsService } from './user-financials.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFinancialsEntity } from './user-financials.entity';
import { UsersModule } from '../users.module';

@Module({
  imports : [TypeOrmModule.forFeature([UserFinancialsEntity]), forwardRef(() => UsersModule)],
  controllers: [UserFinancialsController],
  providers: [UserFinancialsService],
  exports: [UserFinancialsService,TypeOrmModule]
})
export class UserFinancialsModule {}
