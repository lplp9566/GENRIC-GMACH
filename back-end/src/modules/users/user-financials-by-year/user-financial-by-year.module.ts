import { Module } from '@nestjs/common';
import { UserFinancialByYearController } from './user-financials-by-year.controller';
import { UserFinancialByYearService } from './user-financial-by-year.service';
import { UserFinancialByYearEntity } from './user-financial-by-year.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFinancialByYearViewEntity } from './user-financial-by-year.view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserFinancialByYearEntity,UserFinancialByYearViewEntity])],
  controllers: [UserFinancialByYearController],
  providers: [UserFinancialByYearService],
  exports: [UserFinancialByYearService,TypeOrmModule],
  

})
export class UserFinancialByYearModule {}
