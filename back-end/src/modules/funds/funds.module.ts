import { Module } from '@nestjs/common';
import { FundsService } from './funds.service';
import { FundsController } from './funds.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundEntity } from './Entity/funds.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FundEntity])],
  providers: [FundsService],
  controllers: [FundsController]
})
export class FundsModule {}
