import { Module } from '@nestjs/common';
import { NedarimPlusController } from './nedarim-plus.controller';
import { NedarimPlusService } from './nedarim-plus.service';

@Module({
  controllers: [NedarimPlusController],
  providers: [NedarimPlusService],
})
export class NedarimPlusModule {}
