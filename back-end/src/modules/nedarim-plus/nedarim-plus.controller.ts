import { Controller, Get, Query } from '@nestjs/common';
import { NedarimPlusService } from './nedarim-plus.service';

@Controller('nedarim-plus')
export class NedarimPlusController {
  constructor(private readonly nedarimPlusService: NedarimPlusService) {}

  @Get('actions')
  async getActions(
    @Query('source') source?: 'credit' | 'standing-order',
    @Query('lastId') lastId?: string,
    @Query('maxId') maxId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.nedarimPlusService.getActions({ source, lastId, maxId, from, to });
  }
}
