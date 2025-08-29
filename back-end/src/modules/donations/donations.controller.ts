import { Body, Controller, Get, Post } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsEntity } from './Entity/donations.entity';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}
  @Post()
  async createDonation(@Body() donation: DonationsEntity) {
    process.stdout.write('createDonation function called!\n');
    return this.donationsService.createDonation(donation);
  }
  @Get()
  async getDonations() {
    return this.donationsService.getDonations();
  }

  @Post('/window')
  indowDonations(@Body() donations: DonationsEntity) {
    return this.donationsService.withdrawSpecialFund(donations);
  }
}
