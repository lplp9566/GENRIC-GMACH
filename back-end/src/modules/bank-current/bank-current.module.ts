import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankCurrentService } from './bank-current.service';
import { BankCurrentController } from './bank-current.controller';
import { BankCurrentEntity } from './entities/bank-current.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BankCurrentEntity])],
  controllers: [BankCurrentController],
  providers: [BankCurrentService],
})
export class BankCurrentModule {}
