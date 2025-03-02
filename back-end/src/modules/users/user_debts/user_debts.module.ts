import { Module } from '@nestjs/common';
import { UserDebtsController } from './user_debts.controller';
import { UserDebtsService } from './user_debts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDebtsEntity } from './user_debts.entity';

@Module({
  imports:[TypeOrmModule.forFeature([UserDebtsEntity])],
  controllers: [UserDebtsController],
  providers: [UserDebtsService],
  exports :[UserDebtsService,TypeOrmModule]
})
export class UserDebtsModule {}
