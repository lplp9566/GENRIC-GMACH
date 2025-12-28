import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users.module';
import { UserFinancialService } from './user-financials.service';
import { UserFinancialEntity } from './user-financials.entity';
import { UserFinancialController } from './user-financials.controller';
import { UserFinancialViewEntity } from './user-financials.view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserFinancialEntity,UserFinancialViewEntity]),
    // forwardRef(() => UsersModule),
  ],
  controllers: [UserFinancialController],
  providers: [UserFinancialService],
  exports: [UserFinancialService, TypeOrmModule],
})
export class UserFinancialsModule {}
