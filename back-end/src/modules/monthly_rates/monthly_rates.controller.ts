import { Body, Controller, Get, Post } from '@nestjs/common';
import { MonthlyRatesService } from './monthly_rates.service';
import { MonthlyRatesEntity } from './monthly_rates.entity';

@Controller('monthly-rates')
export class MonthlyRatesController {
  constructor(private readonly monthlyRatesService: MonthlyRatesService) {}

  @Get()
async getAllRates(): Promise<MonthlyRatesEntity[]> {
  return this.monthlyRatesService.getAllRates();
}
  // @Get('/:role')
  // async getRatesForRole(role:string): Promise<MonthlyRatesEntity[]> {
  //   return this.monthlyRatesService.getRatesForRole(role);
  // }

  @Post()
  async addRate(@Body() rate: MonthlyRatesEntity): Promise<MonthlyRatesEntity> {
    return this.monthlyRatesService.addRate(rate);
  }


}
