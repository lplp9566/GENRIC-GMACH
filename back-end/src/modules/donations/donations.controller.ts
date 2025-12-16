import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsEntity } from './Entity/donations.entity';
import { IsNumber, IsPositive } from 'class-validator';
import { CreateDonationDto } from '../funds/fundsDto';
export class UpdateDonationDto {
  @IsNumber()
  @IsPositive()
  amount: number;
  date: Date;
}

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}
    @Post()
async createDonation(@Body() dto: CreateDonationDto) {
  return this.donationsService.createDonation(dto);
}
  @Get()
  async getDonations(
  ) {
    return this.donationsService.getDonations();
  }

  @Post('/window')
  indowDonations(@Body() donations: DonationsEntity) {
    return this.donationsService.withdrawSpecialFund(donations);
  }
   @Patch(':id')
  async updateDonation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDonationDto,
  ) {
    // dto.amount הוא הסכום החדש
    return this.donationsService.updateDonation(id, { amount: dto.amount, date: dto.date });
  }
}

