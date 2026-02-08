import { Module } from '@nestjs/common';
import { OrderReturnController } from './order-return.controller';
import { OrderReturnService } from './order-return.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderReturnEntity } from './Entity/order-return.entity';
import { UserFinancialByYearModule } from '../users/user-financials-by-year/user-financial-by-year.module';
import { FundsOverviewModule } from '../funds-overview/funds-overview.module';
import { UserFinancialsModule } from '../users/user-financials/user-financials.module';
import { UsersModule } from '../users/users.module';
import { FundsOverviewByYearModule } from '../funds-overview-by-year/funds-overview-by-year.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports:[TypeOrmModule.forFeature([OrderReturnEntity]),
  UserFinancialByYearModule,FundsOverviewModule,UserFinancialsModule,UsersModule,FundsOverviewByYearModule,MailModule
],
  controllers: [OrderReturnController],
  providers: [OrderReturnService],
  exports :[OrderReturnService,TypeOrmModule]
})
export class OrderReturnModule {}
