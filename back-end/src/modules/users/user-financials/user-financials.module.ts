import { Module } from '@nestjs/common';
import { UserFinancialsController } from './user-financials.controller';
import { UserFinancialsService } from './user-financials.service';
import { UserFinancialsEntity } from './user-financials.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserFinancialsEntity])],
  controllers: [UserFinancialsController],
  providers: [UserFinancialsService],
  exports: [UserFinancialsService,TypeOrmModule],
  

})
export class UserFinancialsModule {}
