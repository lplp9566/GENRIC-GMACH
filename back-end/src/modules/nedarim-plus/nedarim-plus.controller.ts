import { Controller, Get, Query } from '@nestjs/common';
import { NedarimPlusService } from './nedarim-plus.service';

@Controller('nedarim-plus')
export class NedarimPlusController {
  constructor(private readonly nedarimPlusService: NedarimPlusService) {}

  @Get('actions')
  async getActions(
    @Query('lastId') lastId?: string,
    @Query('maxId') maxId?: string,
  ) {
    return this.nedarimPlusService.getActions({ lastId, maxId });
  }
}
