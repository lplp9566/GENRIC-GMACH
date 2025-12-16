import { Body, Controller, Get, Post } from '@nestjs/common';
import { FundsService } from './funds.service';

@Controller('funds')
export class FundsController {
      constructor(private readonly fundsService: FundsService) {}
    
    @Get()
    async getFunds() {
      return this.fundsService.getFunds();
    }
    @Post()
    async findOrCreateByName(@Body(){name}: {name: string}) {
      console.log(name);
      return this.fundsService.findOrCreateByName(name);
    }
  
}
